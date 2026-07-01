// plano-de-aula.servico.ts: cliente HTTP que conversa com a API do backend.
//
// Responsabilidade (espelha a separação de camadas do backend): este serviço
// NÃO conhece detalhes de interface (React, componentes, eventos). Ele apenas
// envia requisições para a API e devolve dados já tipados, ou lança um erro
// com uma mensagem amigável.

import type {
  PlanoDeAulaRascunho,
  PlanoDeAulaFinal,
  RespostaApi,
} from './plano-de-aula.tipos'

/**
 * Serviço responsável pela comunicação com a API de planos de aula.
 *
 * Cobre as duas operações do fluxo principal:
 *   - gerar o rascunho a partir de uma descrição;
 *   - gerar a versão final a partir de um rascunho revisado.
 */
class PlanoDeAulaServico {
  /**
   * URL base da API (ex.: http://localhost:3333).
   */
  private readonly urlBase: string;

  /**
   * Cria uma instância do serviço.
   *
   * @param urlBase URL base da API. Por padrão, lê de VITE_API_URL.
   *   O parâmetro existe principalmente para facilitar os testes (injeção).
   */
  constructor(urlBase: string = import.meta.env.VITE_API_URL || 'http://localhost:3333') {
    this.urlBase = urlBase;
  }

  /**
   * Gera o primeiro rascunho de plano de aula a partir da descrição livre.
   *
   * Endpoint: POST /planos-de-aula/rascunho
   *
   * @param descricao Descrição em linguagem natural informada pelo professor.
   * @returns Rascunho estruturado do plano de aula.
   * @throws Error Caso a API responda com erro.
   */
  async gerarRascunho(descricao: string): Promise<PlanoDeAulaRascunho> {
    return this.enviarPost<PlanoDeAulaRascunho>('/planos-de-aula/rascunho', {
      descricao,
    });
  }

  /**
   * Melhora um rascunho existente com base em orientações adicionais do
   * professor.
   *
   * Endpoint: POST /planos-de-aula/rascunho/melhorar
   *
   * @param rascunho Rascunho atual do plano de aula.
   * @param orientacoes Instruções em linguagem natural para melhorar o rascunho.
   * @returns Rascunho melhorado.
   * @throws Error Caso a API responda com erro.
   */
  async melhorarRascunho(
    rascunho: PlanoDeAulaRascunho,
    orientacoes: string,
  ): Promise<PlanoDeAulaRascunho> {
    return this.enviarPost<PlanoDeAulaRascunho>(
      '/planos-de-aula/rascunho/melhorar',
      { rascunho, orientacoes },
    );
  }

  /**
   * Gera a versão final do plano de aula a partir do rascunho revisado.
   *
   * Endpoint: POST /planos-de-aula/final
   *
   * @param rascunho Rascunho revisado pelo professor.
   * @returns Plano de aula final (com título, plano estruturado e relatório).
   * @throws Error Caso a API responda com erro.
   */
  async gerarPlanoFinal(
    rascunho: PlanoDeAulaRascunho,
  ): Promise<PlanoDeAulaFinal> {
    return this.enviarPost<PlanoDeAulaFinal>('/planos-de-aula/final', {
      rascunho,
    });
  }

  /**
   * Envia uma requisição POST em JSON e devolve apenas o campo "dados" da
   * resposta padrão da API.
   *
   * Centraliza o tratamento de erros: se a resposta HTTP não for bem-sucedida,
   * ou se o corpo indicar `sucesso: false`, lança um Error com a mensagem da API.
   *
   * @param caminho Caminho do endpoint (ex.: "/planos-de-aula/rascunho").
   * @param corpo Objeto que será serializado como JSON no corpo da requisição.
   * @returns Conteúdo do campo "dados" da resposta, já tipado.
   * @template T Tipo esperado em "dados".
   */
  private async enviarPost<T>(caminho: string, corpo: unknown): Promise<T> {
    const resposta = await fetch(`${this.urlBase}${caminho}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(corpo),
    });

    // Tenta ler o corpo como JSON; se falhar, trata como nulo.
    const dados = (await resposta
      .json()
      .catch(() => null)) as RespostaApi<T> | null;

    // Erro de HTTP, corpo ausente ou resposta indicando falha.
    if (!resposta.ok || !dados || !dados.sucesso) {
      const mensagem =
        dados?.mensagem ?? 'Não foi possível comunicar com o servidor.';
      throw new Error(mensagem);
    }

    return dados.dados;
  }
}

// Exporta a classe (para testes) e uma instância pronta para uso nos componentes.
export { PlanoDeAulaServico };
export const planoDeAulaServico = new PlanoDeAulaServico();