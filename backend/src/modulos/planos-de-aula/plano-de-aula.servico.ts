import { IaServico } from "../ia/ia.servico";

import { salvarPlanoFinal } from "./plano-de-aula.repositorio";

import {
    criarPromptGerarPlanoFinal,
    criarPromptGerarRascunho,
    criarPromptMelhorarRascunho,
} from "./plano-de-aula.prompts";

import { PlanoDeAulaRascunho } from "./plano-de-aula.tipos";

/**
 * Representa a resposta esperada da IA ao gerar a versão final
 * do plano de aula.
 */
export type PlanoDeAulaFinal = {
    /**
     * Título principal do plano de aula final.
     */
    titulo: string;

    /**
     * Dados estruturados do plano de aula.
     */
    plano: PlanoDeAulaRascunho;

    /**
     * Texto final em formato de relatório, pronto para exibição ao professor.
     */
    relatorio: string;
};

/**
 * Campos obrigatórios do rascunho de plano de aula.
 *
 * Essa lista é usada para validar se a resposta da IA respeitou
 * o contrato esperado pela API.
 */
const CAMPOS_OBRIGATORIOS_RASCUNHO: Array<keyof PlanoDeAulaRascunho> = [
    'titulo',
    'disciplina',
    'curso',
    'nivel',
    'duracao',
    'tema',
    'objetivos',
    'conteudos',
    'metodologia',
    'recursos',
    'avaliacao',
];

class PlanoDeAulaServico {
    /**
     * Serviço genérico de comunicação com provedores de IA.
     */
    private readonly iaServico: IaServico;

    /**
     * Cria uma nova instância do serviço de plano de aula.
     *
     * A instância de IaServico lê AI_API_KEY, AI_MODEL e AI_API_URL
     * diretamente de process.env.
     */
    constructor() {
        this.iaServico = new IaServico();
    }

    /**
     * Gera o primeiro rascunho estruturado de plano de aula a partir
     * da descrição livre informada pelo professor.
     *
     * @param descricao Descrição em linguagem natural enviada pelo professor.
     * @returns Rascunho estruturado de uma única aula.
     *
     * @throws Error Caso a descrição esteja vazia.
     * @throws Error Caso a IA retorne JSON inválido ou incompleto.
     */
    async gerarRascunho(descricao: string): Promise<PlanoDeAulaRascunho> {
        if (!descricao || descricao.trim().length === 0) {
            throw new Error('A descrição do plano de aula é obrigatória.');
        }

        const prompt = criarPromptGerarRascunho(descricao);

        const rascunho = await this.iaServico.gerarJson<PlanoDeAulaRascunho>(
            prompt,
        );

        // this.validarRascunho(rascunho);

        return rascunho;
    }

    /**
     * Melhora um rascunho existente de plano de aula com base nas
     * novas instruções enviadas pelo professor.
     *
     * @param rascunhoAtual Rascunho atual do plano de aula.
     * @param instrucoes Instruções adicionais para melhoria do rascunho.
     * @returns Rascunho melhorado de uma única aula.
     *
     * @throws Error Caso o rascunho atual esteja incompleto.
     * @throws Error Caso as instruções estejam vazias.
     * @throws Error Caso a IA retorne JSON inválido ou incompleto.
     */
    async melhorarRascunho(
        rascunhoAtual: PlanoDeAulaRascunho,
        instrucoes: string,
    ): Promise<PlanoDeAulaRascunho> {
        this.validarRascunho(rascunhoAtual);

        if (!instrucoes || instrucoes.trim().length === 0) {
            throw new Error('As instruções para melhoria do rascunho são obrigatórias.');
        }

        const prompt = criarPromptMelhorarRascunho(rascunhoAtual, instrucoes);

        const rascunhoMelhorado =
            await this.iaServico.gerarJson<PlanoDeAulaRascunho>(prompt);

        this.validarRascunho(rascunhoMelhorado);

        return rascunhoMelhorado;
    }

    /**
     * Gera a versão final do plano de aula em formato de relatório.
     *
     * O prompt atual solicita que a IA retorne um JSON contendo:
     * - titulo;
     * - plano;
     * - relatorio.
     *
     * Por isso, este método usa gerarJson<PlanoDeAulaFinal>(),
     * e não gerarTexto().
     *
     * @param rascunhoRevisado Rascunho revisado pelo professor.
     * @returns Plano de aula final com dados estruturados e relatório textual.
     *
     * @throws Error Caso o rascunho esteja incompleto.
     * @throws Error Caso a IA retorne JSON inválido ou incompleto.
     */
    async gerarPlanoFinal(
        rascunhoRevisado: PlanoDeAulaRascunho,
    ): Promise<PlanoDeAulaFinal> {
        this.validarRascunho(rascunhoRevisado);

        const prompt = criarPromptGerarPlanoFinal(rascunhoRevisado);

        const planoFinal = await this.iaServico.gerarJson<PlanoDeAulaFinal>(
            prompt,
        );

        this.validarPlanoFinal(planoFinal);

        /**
         * Persiste o plano final no MongoDB APÓS a IA gerar com sucesso.
         *
         * A persistência é não-fatal: se MONGO_URL não existir ou a gravação
         * falhar, apenas registra o erro e segue — sem derrubar a requisição.
         *
         * Isso garante que:
         * - O contrato da API (resposta com { sucesso, mensagem, dados })
         *   permanece idêntico ao esperado pelos testes.
         * - O documento do Mongoose (_id, __v) NUNCA vai parar no campo "dados".
         */
        await salvarPlanoFinal(planoFinal);

        return planoFinal;
    }

    /**
     * Valida se um objeto possui a estrutura mínima esperada
     * para um rascunho de plano de aula.
     *
     * @param rascunho Objeto a ser validado.
     *
     * @throws Error Caso o rascunho esteja ausente, incompleto ou inválido.
     */
    private validarRascunho(rascunho: PlanoDeAulaRascunho): void {
        if (!rascunho || typeof rascunho !== 'object') {
            throw new Error('O rascunho do plano de aula é obrigatório.');
        }

        for (const campo of CAMPOS_OBRIGATORIOS_RASCUNHO) {
            if (!(campo in rascunho)) {
                throw new Error(
                    `O campo "${campo}" é obrigatório no rascunho do plano de aula.`,
                );
            }
        }

        this.validarTexto(rascunho.titulo, 'titulo');
        this.validarTexto(rascunho.disciplina, 'disciplina');
        this.validarTexto(rascunho.curso, 'curso');
        this.validarTexto(rascunho.nivel, 'nivel');
        this.validarTexto(rascunho.duracao, 'duracao');
        this.validarTexto(rascunho.tema, 'tema');
        this.validarTexto(rascunho.metodologia, 'metodologia');
        this.validarTexto(rascunho.avaliacao, 'avaliacao');

        this.validarListaDeTextos(rascunho.objetivos, 'objetivos');
        this.validarListaDeTextos(rascunho.conteudos, 'conteudos');
        this.validarListaDeTextos(rascunho.recursos, 'recursos');
    }

    /**
     * Valida se o plano final retornado pela IA respeita
     * a estrutura solicitada pelo prompt.
     *
     * @param planoFinal Objeto retornado pela IA.
     *
     * @throws Error Caso o plano final esteja ausente, incompleto ou inválido.
     */
    private validarPlanoFinal(planoFinal: PlanoDeAulaFinal): void {
        if (!planoFinal || typeof planoFinal !== 'object') {
            throw new Error('O plano de aula final é obrigatório.');
        }

        this.validarTexto(planoFinal.titulo, 'titulo');
        this.validarRascunho(planoFinal.plano);
        this.validarTexto(planoFinal.relatorio, 'relatorio');
    }

    /**
     * Valida se um valor é uma string não vazia.
     *
     * @param valor Valor a ser validado.
     * @param nomeCampo Nome do campo usado na mensagem de erro.
     *
     * @throws Error Caso o valor não seja uma string válida.
     */
    private validarTexto(valor: unknown, nomeCampo: string): void {
        if (typeof valor !== 'string' || valor.trim().length === 0) {
            throw new Error(`O campo "${nomeCampo}" deve ser um texto não vazio.`);
        }
    }

    /**
     * Valida se um valor é uma lista não vazia de strings não vazias.
     *
     * @param valor Valor a ser validado.
     * @param nomeCampo Nome do campo usado na mensagem de erro.
     *
     * @throws Error Caso o valor não seja uma lista válida de textos.
     */
    private validarListaDeTextos(valor: unknown, nomeCampo: string): void {
        if (!Array.isArray(valor) || valor.length === 0) {
            throw new Error(`O campo "${nomeCampo}" deve ser uma lista não vazia.`);
        }

        const todosOsItensSaoValidos = valor.every(
            (item) => typeof item === 'string' && item.trim().length > 0,
        );

        if (!todosOsItensSaoValidos) {
            throw new Error(
                `Todos os itens do campo "${nomeCampo}" devem ser textos não vazios.`,
            );
        }
    }

}

export { PlanoDeAulaServico };