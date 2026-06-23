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
  PlanoSalvo,
  PlanoSalvoCompleto,
} from './plano-de-aula.tipos'

import { mapearErroParaUsuario } from '../../utils/erros';

/**
 * Serviço responsável pela comunicação com a API de planos de aula.
 *
 * Cobre as operações do fluxo principal:
 *   - gerar o rascunho a partir de uma descrição;
 *   - melhorar o rascunho com orientações;
 *   - gerar a versão final a partir de um rascunho revisado;
 *   - listar planos salvos;
 *   - buscar um plano salvo pelo ID.
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
   */
  constructor(urlBase: string = import.meta.env.VITE_API_URL) {
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
   * @param sessaoId Identificador único da sessão (para persistência).
   * @returns Plano de aula final (com título, plano estruturado e relatório).
   * @throws Error Caso a API responda com erro.
   */
  async gerarPlanoFinal(
    rascunho: PlanoDeAulaRascunho,
    sessaoId: string,
  ): Promise<PlanoDeAulaFinal> {
    return this.enviarPost<PlanoDeAulaFinal>('/planos-de-aula/final', {
      rascunhoRevisado: rascunho,
      sessaoId,
    });
  }

  /**
   * Lista todos os planos salvos de uma sessão.
   *
   * Endpoint: GET /planos-de-aula?sessaoId=...
   *
   * @param sessaoId Identificador único da sessão.
   * @returns Lista de planos resumidos (título, data, ID).
   * @throws Error Caso a API responda com erro.
   */
  async listarPlanosSalvos(sessaoId: string): Promise<PlanoSalvo[]> {
    const resposta = await fetch(
      `${this.urlBase}/planos-de-aula?sessaoId=${encodeURIComponent(sessaoId)}`
    );

    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status}: ${resposta.statusText}`);
    }

    const dados = await resposta.json() as RespostaApi<PlanoSalvo[]>;

    if (!dados.sucesso) {
      throw new Error(dados.mensagem || 'Erro ao listar planos');
    }

    return dados.dados || [];
  }

  /**
   * Busca um plano específico pelo ID.
   *
   * Endpoint: GET /planos-de-aula/:id?sessaoId=...
   *
   * @param id ID do plano no MongoDB.
   * @param sessaoId Identificador da sessão (para segurança).
   * @returns Plano completo ou null se não encontrado.
   * @throws Error Caso a API responda com erro.
   */
  async buscarPlanoPorId(id: string, sessaoId: string): Promise<PlanoSalvoCompleto | null> {
    const resposta = await fetch(
      `${this.urlBase}/planos-de-aula/${id}?sessaoId=${encodeURIComponent(sessaoId)}`
    );

    if (resposta.status === 404) {
      return null;
    }

    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status}: ${resposta.statusText}`);
    }

    const dados = await resposta.json() as RespostaApi<PlanoSalvoCompleto>;

    if (!dados.sucesso) {
      throw new Error(dados.mensagem || 'Erro ao buscar plano');
    }

    return dados.dados;
  }




  /**
   * Envia uma requisição POST em JSON e devolve apenas o campo "dados" da
   * resposta padrão da API.
   */
  private async enviarPost<T>(caminho: string, corpo: unknown): Promise<T> {
    try {
      const resposta = await fetch(`${this.urlBase}${caminho}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(corpo),
      });

      const dados = (await resposta
        .json()
        .catch(() => null)) as RespostaApi<T> | null;

      if (!resposta.ok || !dados || !dados.sucesso) {
        // --- LOG COMPLETO NO CONSOLE PARA O DESENVOLVEDOR ---
        console.group('🐛 ERRO DETALHADO - enviarPost');
        console.log('📌 Endpoint:', caminho);
        console.log('📌 Status HTTP:', resposta.status);
        console.log('📌 Corpo da requisição:', corpo);
        console.log('📌 Resposta da API:', dados);
        console.log('📌 Headers:', Object.fromEntries(resposta.headers));
        console.groupEnd();

        // Extrai a mensagem bruta do erro
        const mensagemBruta = dados?.mensagem ?? 'Não foi possível comunicar com o servidor.';

        // Mapeia para uma mensagem amigável
        const erroMapeado = mapearErroParaUsuario(new Error(mensagemBruta));

        // Lança com a mensagem amigável (mas o erro completo está no console)
        throw new Error(erroMapeado.mensagem);
      }

      return dados.dados;
    } catch (erro) {
      // Se já for um erro que criamos, repassa
      if (erro instanceof Error && erro.message) {
        // Log adicional para erros de rede
        if (erro.message.includes('Failed to fetch') || erro.message.includes('NetworkError')) {
          console.group('🌐 ERRO DE REDE');
          console.log('📌 Mensagem:', erro.message);
          console.log('📌 Stack:', erro.stack);
          console.groupEnd();
        }
        throw erro;
      }

      // Fallback para erros desconhecidos
      console.group('❌ ERRO DESCONHECIDO');
      console.log('📌 Erro:', erro);
      console.groupEnd();

      const erroMapeado = mapearErroParaUsuario(erro);
      throw new Error(erroMapeado.mensagem);
    }
  }

}

// Exporta a classe (para testes) e uma instância pronta para uso nos componentes.
export { PlanoDeAulaServico };
export const planoDeAulaServico = new PlanoDeAulaServico();