/**
*  Representar um rascunho estruturado de plano de aula
*  POST /planos-de-aula/rascunho
*/
export type PlanoDeAulaRascunho = {
    titulo: string;
    disciplina: string;
    curso: string;
    nivel: string;
    duracao: string;
    tema: string;
    objetivos: string[];
    conteudos: string[];
    metodologia: string;
    recursos: string[];
    avaliacao: string;
}

/**
*  Dados necessários para gerar o primeiro plano (rascunho)
*  POST /planos-de-aula/rascunho
*/
export type DadosGerarRascunho = {
    descricao: string;
}

/**
 * Dados necessáios para melhorar o rascunho
 * POST /planos-de-aula/rascunho/melhorar
 */
export type DadosMelhorarRascunho = {
    rascunhoAtual: PlanoDeAulaRascunho;
    instrucoes: string;
}

/**
 * Dados necessáios para gerar a versão final do plano de aula
 * POST /planos-de-aula/final
 */
export type DadosGerarPlanoFinal = {
    rascunhoRevisado: PlanoDeAulaRascunho;
}

/**
 * Representa o plano de aula final
 */
export type PlanoDeAulaFinal = {
    titulo: string;
    plano: PlanoDeAulaRascunho;
    relatorio: string;
}

/**
 * Resposta da API da IA
 */
export type RespostaApi<T> = {
    sucesso: boolean;
    mensagem: string;
    dados:T;
}