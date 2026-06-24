import { IaServico } from "../ia/ia.servico";

import {
    criarPromptGerarPlanoFinal,
    criarPromptGerarRascunho,
    criarPromptMelhorarRascunho,
} from "./plano-de-aula.prompts";

import { PlanoDeAulaRascunho } from "./plano-de-aula.tipos";

import { PlanoDeAulaRepositorio } from './plano-de-aula.repositorio';

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
     */
    constructor() {
        this.iaServico = new IaServico();
    }

    /**
     * Gera o primeiro rascunho estruturado de plano de aula a partir
     * da descrição livre informada pelo professor.
     */
    async gerarRascunho(descricao: string): Promise<PlanoDeAulaRascunho> {
        if (!descricao || descricao.trim().length === 0) {
            throw new Error('A descrição do plano de aula é obrigatória.');
        }

        const prompt = criarPromptGerarRascunho(descricao);

        const rascunho = await this.iaServico.gerarJson<PlanoDeAulaRascunho>(
            prompt,
        );

        return rascunho;
    }

    /**
     * Melhora um rascunho existente de plano de aula com base nas
     * novas instruções enviadas pelo professor.
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
     * Gera a versão final do plano de aula em formato de relatório
     * e persiste no MongoDB.
     */
    async gerarPlanoFinal(
        rascunhoRevisado: PlanoDeAulaRascunho,
        sessaoId?: string, // <-- OPCIONAL
    ): Promise<PlanoDeAulaFinal> {
        this.validarRascunho(rascunhoRevisado);

        const prompt = criarPromptGerarPlanoFinal(rascunhoRevisado);

        const planoFinal = await this.iaServico.gerarJson<PlanoDeAulaFinal>(
            prompt,
        );

        this.validarPlanoFinal(planoFinal);

        // --- Persistência no MongoDB (SÓ SE TIVER sessaoId) ---
        if (sessaoId) { 
            try {
                console.log('Tentando salvar plano no MongoDB...');
                console.log('Sessão ID:', sessaoId);

                const dadosParaSalvar = {
                    titulo: planoFinal.titulo,
                    plano: JSON.stringify(planoFinal.plano),
                    relatorio: planoFinal.relatorio
                };

                const repositorio = new PlanoDeAulaRepositorio();
                await repositorio.salvar(dadosParaSalvar, sessaoId);

                console.log('Plano final salvo com sucesso no MongoDB');
            } catch (erro) {
                console.error('Erro ao salvar plano no MongoDB (nao critico):', erro);
            }
        } else {
            console.log('Persistência ignorada: sessaoId não fornecida');
        }

        return planoFinal;
    }

    /**
     * Lista todos os planos de aula de uma sessão
     */
    async listarPlanos(sessaoId: string): Promise<any[]> {
        try {
            const repositorio = new PlanoDeAulaRepositorio();
            return await repositorio.listarTodos(sessaoId);
        } catch (erro) {
            console.error('Erro ao listar planos:', erro);
            return [];
        }
    }

    /**
     * Busca um plano específico pelo ID
     */
    async buscarPlanoPorId(id: string, sessaoId: string): Promise<any> {
        try {
            const repositorio = new PlanoDeAulaRepositorio();
            return await repositorio.buscarPorId(id, sessaoId);
        } catch (erro) {
            console.error('Erro ao buscar plano:', erro);
            return null;
        }
    }

    /**
     * Valida se um objeto possui a estrutura mínima esperada
     * para um rascunho de plano de aula.
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
     */
    private validarPlanoFinal(planoFinal: PlanoDeAulaFinal): void {
        if (!planoFinal || typeof planoFinal !== 'object') {
            throw new Error('O plano de aula final é obrigatório.');
        }

        this.validarTexto(planoFinal.titulo, 'titulo');
        this.validarRascunho(planoFinal.plano);
        this.validarTexto(planoFinal.relatorio, 'relatorio');
    }

    private validarTexto(valor: unknown, nomeCampo: string): void {
        if (typeof valor !== 'string' || valor.trim().length === 0) {
            throw new Error(`O campo "${nomeCampo}" deve ser um texto não vazio.`);
        }
    }

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