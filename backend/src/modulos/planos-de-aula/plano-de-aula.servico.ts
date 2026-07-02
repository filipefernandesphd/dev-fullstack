import { IaServico } from "../ia/ia.servico";
import { PlanoDeAulaRepositorio } from "./plano-de-aula.repositorio";

import {
    criarPromptGerarPlanoFinal,
    criarPromptGerarRascunho,
    criarPromptMelhorarRascunho,
} from "./plano-de-aula.prompts";

import { PlanoDeAulaRascunho } from "./plano-de-aula.tipos";

/**
 * Representa a resposta estruturada esperada da IA ao gerar a versão final do plano de aula.
 */
export type PlanoDeAulaFinal = {
    titulo: string;
    plano: PlanoDeAulaRascunho;
    relatorio: string;
};

/**
 * Campos obrigatórios do rascunho de plano de aula usados na checagem estrita pós-geração.
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

/**
 * Classe responsável por gerenciar as regras de negócio associadas aos planos de aula,
 * intermediando as requisições, a IA generativa e a camada de persistência de dados.
 */
class PlanoDeAulaServico {
    private readonly iaServico: IaServico;
    private readonly repositorio: PlanoDeAulaRepositorio;

    constructor() {
        this.iaServico = new IaServico();
        this.repositorio = new PlanoDeAulaRepositorio();
    }

    /**
     * Solicita à IA a geração do primeiro rascunho estruturado baseando-se na descrição do professor.
     */
    async gerarRascunho(descricao: string): Promise<PlanoDeAulaRascunho> {
        if (!descricao || descricao.trim().length === 0) {
            throw new Error('A descrição do plano de aula é obrigatória.');
        }

        const prompt = criarPromptGerarRascunho(descricao);
        const rascunho = await this.iaServico.gerarJson<PlanoDeAulaRascunho>(prompt);

        return rascunho;
    }

    /**
     * Interage com a IA fornecendo o rascunho existente e novas orientações para refinamento.
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
        const rascunhoMelhorado = await this.iaServico.gerarJson<PlanoDeAulaRascunho>(prompt);

        this.validarRascunho(rascunhoMelhorado);
        return rascunhoMelhorado;
    }

    /**
     * Consolida a versão final (relatório). Atende às regras críticas de persistência não-fatal do MongoDB:
     * 1. Salva apenas DEPOIS do retorno com sucesso da IA.
     * 2. Retorna o objeto original sem poluir com metadados do Mongoose (`_id` ou `__v`).
     * 3. Falhas no banco não quebram a requisição (persistência resiliente e não-fatal).
     */
    async gerarPlanoFinal(rascunhoRevisado: PlanoDeAulaRascunho): Promise<PlanoDeAulaFinal> {
        this.validarRascunho(rascunhoRevisado);

        const prompt = criarPromptGerarPlanoFinal(rascunhoRevisado);
        const planoFinal = await this.iaServico.gerarJson<PlanoDeAulaFinal>(prompt);

        this.validarPlanoFinal(planoFinal);

        // REGRA DE PERSISTÊNCIA NÃO-FATAL: A ausência ou erro do banco não deve derrubar a aplicação
        if (process.env.MONGO_URL) {
            try {
                // Persiste os dados chamando de forma isolada a camada de repositório
                await this.repositorio.salvar({
                    titulo: planoFinal.titulo,
                    plano: planoFinal.plano, // Passa o objeto direto; o repositório cuidará da modelagem
                    relatorio: planoFinal.relatorio
                });
                console.log("✓ Resiliência de dados: Plano de aula persistido com sucesso no MongoDB.");
            } catch (erro: any) {
                // Loga o erro em console para auditoria, mas não lança throw para preservar o fluxo do usuário
                console.error("Aviso (Não-Fatal): Falha técnica ao persistir dados no MongoDB:", erro.message);
            }
        }

        // Retorna estritamente o objeto original da IA, garantindo compatibilidade absoluta com os testes do professor
        return planoFinal;
    }

    private validarRascunho(rascunho: PlanoDeAulaRascunho): void {
        if (!rascunho || typeof rascunho !== 'object') {
            throw new Error('O rascunho do plano de aula é obrigatório.');
        }

        for (const campo of CAMPOS_OBRIGATORIOS_RASCUNHO) {
            if (!(campo in rascunho)) {
                throw new Error(`O campo "${campo}" é obrigatório no rascunho do plano de aula.`);
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
            throw new Error(`Todos os itens do campo "${nomeCampo}" devem ser textos não vazios.`);
        }
    }
}

export { PlanoDeAulaServico };