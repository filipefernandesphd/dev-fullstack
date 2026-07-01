import { IaServico } from "../ia/ia.servico";

import {
    criarPromptGerarPlanoFinal,
    criarPromptGerarRascunho,
    criarPromptMelhorarRascunho,
} from "./plano-de-aula.prompts";

import { PlanoDeAulaRascunho } from "./plano-de-aula.tipos";
import { planoDeAulaRepositorio } from "./plano-de-aula.repositorio";

/**
 * Representa a resposta esperada da IA ao gerar a versão final
 * do plano de aula.
 */
export type PlanoDeAulaFinal = {
    titulo: string;
    plano: PlanoDeAulaRascunho;
    relatorio: string;
};

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
    private readonly iaServico: IaServico;

    constructor() {
        this.iaServico = new IaServico();
    }

    async gerarRascunho(descricao: string): Promise<PlanoDeAulaRascunho> {
        if (!descricao || descricao.trim().length === 0) {
            throw new Error('A descrição do plano de aula é obrigatória.');
        }

        const prompt = criarPromptGerarRascunho(descricao);

        return await this.iaServico.gerarJson<PlanoDeAulaRascunho>(prompt);
    }

    async melhorarRascunho(
        rascunhoAtual: PlanoDeAulaRascunho,
        instrucoes: string,
    ): Promise<PlanoDeAulaRascunho> {
        this.validarRascunho(rascunhoAtual);

        if (!instrucoes || instrucoes.trim().length === 0) {
            throw new Error('As instruções para melhoria do rascunho são obrigatórias.');
        }

        const prompt = criarPromptMelhorarRascunho(rascunhoAtual, instrucoes);

        const resultado =
            await this.iaServico.gerarJson<PlanoDeAulaRascunho>(prompt);

        this.validarRascunho(resultado);

        return resultado;
    }

    async gerarPlanoFinal(
        rascunhoRevisado: PlanoDeAulaRascunho,
    ): Promise<PlanoDeAulaFinal> {
        this.validarRascunho(rascunhoRevisado);

        const prompt = criarPromptGerarPlanoFinal(rascunhoRevisado);

        const planoFinal =
            await this.iaServico.gerarJson<PlanoDeAulaFinal>(prompt);

        this.validarPlanoFinal(planoFinal);

        /**
         * PERSISTÊNCIA SEGURA (não interfere no contrato da API)
         *
         * Regras:
         * - nunca quebrar endpoint
         * - nunca alterar retorno
         * - salvar apenas campos necessários
         */
        try {
            if (process.env.MONGO_URL) {
                await planoDeAulaRepositorio.salvar({
                    titulo: planoFinal.titulo,
                    plano: planoFinal.plano,
                    relatorio: planoFinal.relatorio,
                });
            }
        } catch (erro) {
            console.error(
                '[MongoDB] Falha ao salvar plano de aula (não fatal):',
                erro,
            );
        }

        return planoFinal;
    }

    private validarRascunho(rascunho: PlanoDeAulaRascunho): void {
        if (!rascunho || typeof rascunho !== 'object') {
            throw new Error('O rascunho do plano de aula é obrigatório.');
        }

        for (const campo of CAMPOS_OBRIGATORIOS_RASCUNHO) {
            if (!(campo in rascunho)) {
                throw new Error(`Campo obrigatório ausente: ${campo}`);
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
            throw new Error('Plano final inválido.');
        }

        this.validarTexto(planoFinal.titulo, 'titulo');
        this.validarRascunho(planoFinal.plano);
        this.validarTexto(planoFinal.relatorio, 'relatorio');
    }

    private validarTexto(valor: unknown, campo: string): void {
        if (typeof valor !== 'string' || valor.trim().length === 0) {
            throw new Error(`Campo inválido: ${campo}`);
        }
    }

    private validarListaDeTextos(valor: unknown, campo: string): void {
        if (!Array.isArray(valor) || valor.length === 0) {
            throw new Error(`Lista inválida: ${campo}`);
        }

        if (!valor.every(v => typeof v === 'string' && v.trim())) {
            throw new Error(`Itens inválidos em: ${campo}`);
        }
    }
}

export { PlanoDeAulaServico };