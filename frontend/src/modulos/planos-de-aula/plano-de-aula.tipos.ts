// plano-de-aula.tipos.ts: tipos do domínio de planos de aula no frontend.
//
// CONTRACT-FIRST: estes tipos espelham o contrato do backend
// (backend/src/modulos/planos-de-aula/plano-de-aula.tipos.ts). Se o backend
// mudar o formato das respostas, estes tipos devem acompanhar.

/**
 * Rascunho estruturado de plano de aula.
 *
 * Corresponde ao campo "dados" retornado por:
 *   POST /planos-de-aula/rascunho
 */
export type PlanoDeAulaRascunho = {
  /** Título sugerido para o plano de aula. */
  titulo: string;

  /** Disciplina relacionada ao plano de aula. */
  disciplina: string;

  /** Curso, etapa de ensino ou contexto educacional. */
  curso: string;

  /** Nível, série, ano ou módulo do curso. */
  nivel: string;

  /** Duração prevista da aula (ex.: "50 minutos"). */
  duracao: string;

  /** Tema central da aula. */
  tema: string;

  /** Objetivos de aprendizagem. */
  objetivos: string[];

  /** Conteúdos que serão trabalhados na aula. */
  conteudos: string[];

  /** Estratégia metodológica da aula. */
  metodologia: string;

  /** Recursos didáticos necessários. */
  recursos: string[];

  /** Estratégia de avaliação da aprendizagem. */
  avaliacao: string;
};

/**
 * Versão final do plano de aula em formato de relatório.
 *
 * Corresponde ao campo "dados" retornado por:
 *   POST /planos-de-aula/final
 */
export type PlanoDeAulaFinal = {
  /** Título principal do plano de aula final. */
  titulo: string;

  /** Dados estruturados do plano (mesmo formato do rascunho). */
  plano: PlanoDeAulaRascunho;

  /** Texto final em formato de relatório, pronto para exibição. */
  relatorio: string;
};

/**
 * Formato padrão de resposta da API do backend.
 *
 * Sempre no formato:
 *   { sucesso: boolean; mensagem: string; dados: T }
 *
 * @template T Tipo dos dados retornados pela operação.
 */
export type RespostaApi<T> = {
  /** Indica se a operação foi executada com sucesso. */
  sucesso: boolean;

  /** Mensagem amigável descrevendo o resultado. */
  mensagem: string;

  /** Dados retornados pela operação. */
  dados: T;
};

/**
 * Representa um plano salvo no MongoDB (versão resumida para listagem)
 * 
 * Retornado por: GET /planos-de-aula?sessaoId=...
 */
export type PlanoSalvo = {
  /** ID único do plano no MongoDB */
  _id: string;
  /** Título do plano */
  titulo: string;
  /** Data de criação (ISO string) */
  criadoEm: string;
};

/**
 * Representa um plano salvo no MongoDB (versão completa)
 * 
 * Retornado por: GET /planos-de-aula/:id?sessaoId=...
 */
export type PlanoSalvoCompleto = {
  /** ID único do plano no MongoDB */
  _id: string;
  /** Título do plano */
  titulo: string;
  /** Plano estruturado (JSON string) */
  plano: string;
  /** Relatório final */
  relatorio: string;
  /** ID da sessão que criou o plano */
  sessaoId: string;
  /** Data de criação (ISO string) */
  criadoEm: string;
};