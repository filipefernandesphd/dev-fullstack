// Importa o Zod, biblioteca de validação e inferência de tipos.
import { z } from 'zod';

// Importa o tipo de domínio para garantir, em tempo de compilação, que o
// esquema e o tipo descrevem a mesma estrutura.
import type { PlanoDeAulaRascunho } from './plano-de-aula.tipos';

/**
 * Mensagens de erro padronizadas.
 *
 * Centralizá-las aqui evita "strings mágicas" espalhadas e garante que as
 * mensagens fiquem idênticas às esperadas pelos testes e pela documentação.
 */
export const MENSAGENS_VALIDACAO = {
  descricaoMinima: 'A descrição deve ter pelo menos 10 caracteres.',
  rascunhoObrigatorio: 'O rascunho do plano de aula é obrigatório.',
  orientacoesObrigatorias:
    'As orientações para melhoria do rascunho são obrigatórias.',
} as const;

/**
 * Esquema de um texto simples obrigatório (string não vazia após `trim`).
 *
 * É reutilizado nos vários campos textuais do rascunho.
 *
 * @param mensagem Mensagem de erro exibida quando o texto for inválido.
 */
const textoObrigatorio = (mensagem: string) =>
  z
    .string({ error: mensagem })
    .trim()
    .min(1, { error: mensagem });

/**
 * Esquema de uma lista não vazia de textos não vazios.
 *
 * @param mensagem Mensagem de erro exibida quando a lista for inválida.
 */
const listaDeTextosObrigatoria = (mensagem: string) =>
  z
    .array(z.string().trim().min(1, { error: mensagem }), { error: mensagem })
    .min(1, { error: mensagem });

/**
 * Esquema de validação de um rascunho completo de plano de aula.
 *
 * Descreve exatamente o contrato do tipo `PlanoDeAulaRascunho`
 * (ver plano-de-aula.tipos.ts). É usado como ENTRADA das rotas
 * `melhorar` e `final`, que recebem um rascunho já preenchido.
 *
 * A mensagem de erro do objeto (`error`) é usada quando o rascunho não é
 * enviado (undefined) ou não é um objeto — daí "O rascunho ... é obrigatório.".
 */
export const esquemaPlanoDeAulaRascunho = z.object(
  {
    titulo: textoObrigatorio('O campo "titulo" deve ser um texto não vazio.'),
    disciplina: textoObrigatorio(
      'O campo "disciplina" deve ser um texto não vazio.',
    ),
    curso: textoObrigatorio('O campo "curso" deve ser um texto não vazio.'),
    nivel: textoObrigatorio('O campo "nivel" deve ser um texto não vazio.'),
    duracao: textoObrigatorio('O campo "duracao" deve ser um texto não vazio.'),
    tema: textoObrigatorio('O campo "tema" deve ser um texto não vazio.'),
    objetivos: listaDeTextosObrigatoria(
      'O campo "objetivos" deve ser uma lista não vazia.',
    ),
    conteudos: listaDeTextosObrigatoria(
      'O campo "conteudos" deve ser uma lista não vazia.',
    ),
    metodologia: textoObrigatorio(
      'O campo "metodologia" deve ser um texto não vazio.',
    ),
    recursos: listaDeTextosObrigatoria(
      'O campo "recursos" deve ser uma lista não vazia.',
    ),
    avaliacao: textoObrigatorio(
      'O campo "avaliacao" deve ser um texto não vazio.',
    ),
  },
  { error: MENSAGENS_VALIDACAO.rascunhoObrigatorio },
);

/**
 * Esquema de ENTRADA da rota `POST /planos-de-aula/rascunho`.
 *
 * O professor envia apenas uma descrição em linguagem natural, que deve ter
 * pelo menos 10 caracteres (após `trim`).
 */
export const esquemaGerarRascunho = z.object({
  descricao: z
    .string({ error: MENSAGENS_VALIDACAO.descricaoMinima })
    .trim()
    .min(10, { error: MENSAGENS_VALIDACAO.descricaoMinima }),
});

/**
 * Esquema de ENTRADA da rota `POST /planos-de-aula/rascunho/melhorar`.
 *
 * Recebe o rascunho atual (completo) e as orientações do professor.
 *
 * Observação: `rascunho` é declarado ANTES de `orientacoes` para que, em caso
 * de ambos ausentes, a primeira mensagem retornada seja a do rascunho.
 */
export const esquemaMelhorarRascunho = z.object({
  rascunho: esquemaPlanoDeAulaRascunho,
  orientacoes: z
    .string({ error: MENSAGENS_VALIDACAO.orientacoesObrigatorias })
    .trim()
    .min(1, { error: MENSAGENS_VALIDACAO.orientacoesObrigatorias }),
});

/**
 * Esquema de ENTRADA da rota `POST /planos-de-aula/final`.
 *
 * Recebe o rascunho revisado (completo) que será transformado em plano final.
 */
export const esquemaGerarPlanoFinal = z.object({
  rascunho: esquemaPlanoDeAulaRascunho,
});

/**
 * Resultado padronizado de uma validação.
 *
 * - Em sucesso, devolve os dados já validados e tipados.
 * - Em falha, devolve apenas a primeira mensagem de erro encontrada (é o que o
 *   contrato da API expõe ao cliente neste estágio do projeto).
 *
 * @template T Tipo dos dados validados.
 */
export type ResultadoValidacao<T> =
  | { sucesso: true; dados: T }
  | { sucesso: false; mensagem: string };

/**
 * Executa um esquema Zod sobre um valor desconhecido (normalmente `req.body`)
 * e converte o resultado para o formato `ResultadoValidacao`.
 *
 * Usa `safeParse` para NÃO lançar exceção: assim o controlador decide o status
 * HTTP (400) sem depender de try/catch para validação de entrada.
 *
 * @param esquema Esquema Zod a ser aplicado.
 * @param dados Valor a ser validado (geralmente o corpo da requisição).
 * @returns Resultado com os dados validados ou a primeira mensagem de erro.
 */
export function validarComEsquema<T>(
  esquema: z.ZodType<T>,
  dados: unknown,
): ResultadoValidacao<T> {
  const resultado = esquema.safeParse(dados);

  if (resultado.success) {
    return { sucesso: true, dados: resultado.data };
  }

  // Pegamos apenas a primeira mensagem para manter a resposta simples e
  // compatível com o contrato atual da API.
  const mensagem = resultado.error.issues[0]?.message ?? 'Dados inválidos.';

  return { sucesso: false, mensagem };
}

/**
 * Verificação de compatibilidade em tempo de compilação: garante que o esquema
 * do rascunho infere exatamente o tipo `PlanoDeAulaRascunho`. Se um dia o tipo
 * e o esquema divergirem, o TypeScript acusará erro aqui.
 */
type _RascunhoInferido = z.infer<typeof esquemaPlanoDeAulaRascunho>;
const _verificacaoDeTipo: _RascunhoInferido = {} as PlanoDeAulaRascunho;
void _verificacaoDeTipo;