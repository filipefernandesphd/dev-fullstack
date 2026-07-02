// Importações necessárias para o controlador
import { Request, Response } from 'express';

// Importação do serviço de planos de aula
import { PlanoDeAulaServico, type PlanoDeAulaFinal } from './plano-de-aula.servico';

// Importação do rascunho do plano de aula
import type { PlanoDeAulaRascunho } from './plano-de-aula.tipos';

// Importação dos esquemas de validação (Zod) e do utilitário que os executa.

// Validamos a ENTRADA aqui mesmo, no controlador, SEM middleware de validação.
import {
  esquemaGerarRascunho,
  esquemaMelhorarRascunho,
  esquemaGerarPlanoFinal,
  validarComEsquema,
} from './plano-de-aula.validacao'

/**
 * Controlador responsável por receber as requisições HTTP relacionadas
 * ao módulo de planos de aula.
 *
 * O controlador atua como uma ponte entre a rota HTTP e o serviço de aplicação.
 */
class PlanoDeAulaControlador {
  /**
   * Serviço responsável pela lógica de aplicação dos planos de aula.
   */
  private planoDeAulaServico: PlanoDeAulaServico;

  /**
   * Cria uma instância do controlador de planos de aula.
   */
  constructor() {
    this.planoDeAulaServico = new PlanoDeAulaServico();
  }

  /**
   * Gera um rascunho de plano de aula a partir de uma descrição em linguagem natural.
   *
   * Endpoint relacionado:
   * POST /planos-de-aula/rascunho
   * 
   * Corpo esperado:
   * {
   *   "descricao": "Crie um plano de aula sobre introdução à engenharia de software..."
   * }
   *
   * @param req Objeto da requisição HTTP do Express.
   * @param res Objeto da resposta HTTP do Express.
   * @returns Resposta HTTP contendo o rascunho do plano de aula ou uma mensagem de erro.
   */
  gerarRascunho = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      /**
       * Validação de entrada com Zod (sem middleware): aplicamos o esquema
       * diretamente sobre o corpo da requisição. A mensagem de erro segue o
       * contrato definido no Swagger.
       */
      const validacao = validarComEsquema(esquemaGerarRascunho, req.body);

      if (!validacao.sucesso) {
        return res.status(400).json({
          sucesso: false,
          mensagem: validacao.mensagem,
        });
      }

      const { descricao } = validacao.dados;

      /**
       * Capturamos a descrição, ou seja, os campos do plano de aula e devolve um objeto PlanoDeAulaRascunho.
       */
      const rascunho = await this.planoDeAulaServico.gerarRascunho(
        descricao,
      );

      /**
       * Retornamos o rascunho do plano de aula gerado (ainda sem processamento de IA).
       */
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Rascunho do plano de aula gerado com sucesso.',
        dados: rascunho,
      });
    } catch (erro) {
      return this.tratarErro(res, erro);
    }
  };

  /**
   * Controlador responsável por melhorar um rascunho de plano de aula já existente.
   *
   * Endpoint esperado:
   * POST /api/planos-de-aula/rascunho/melhorar
   *
   * Corpo esperado:
   * {
   *   "rascunho": { ... },
   *   "orientacoes": "Deixe a metodologia mais ativa e participativa."
   * }
   *
   * @param req Requisição HTTP do Express.
   * @param res Resposta HTTP do Express.
   * @returns Resposta JSON contendo o rascunho melhorado.
   */
  melhorarRascunho = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      /**
       * Validação de entrada com Zod (sem middleware): o esquema cobre tanto a
       * presença/estrutura do rascunho quanto a obrigatoriedade das orientações.
       * Como o rascunho é declarado antes das orientações no esquema, se ambos
       * faltarem a primeira mensagem retornada é a do rascunho.
       */
      const validacao = validarComEsquema(esquemaMelhorarRascunho, req.body);

      if (!validacao.sucesso) {
        return res.status(400).json({
          sucesso: false,
          mensagem: validacao.mensagem,
          dados: null,
        });
      }

      const rascunho: PlanoDeAulaRascunho = validacao.dados.rascunho;
      const { orientacoes } = validacao.dados;

      const rascunhoMelhorado = await this.planoDeAulaServico.melhorarRascunho(
        rascunho,
        orientacoes,
      );

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Rascunho do plano de aula melhorado com sucesso.',
        dados: rascunhoMelhorado,
      });
    } catch (erro) {
      return this.tratarErro(res, erro);
    }
  };

  /**
   * Gera a versão final do plano de aula em formato de relatório.
   *
   * Endpoint relacionado:
   *
   * POST /planos-de-aula/final
   *
   * Corpo esperado:
   *
   * {
   *   "rascunho": {
   *     "titulo": "Introdução à Engenharia de Software",
   *     "disciplina": "Engenharia de Software",
   *     "curso": "Graduação em Computação",
   *     "nivel": "Iniciante",
   *     "duracao": "50 minutos",
   *     "tema": "Conceitos iniciais de Engenharia de Software",
   *     "objetivos": ["Compreender o conceito de Engenharia de Software."],
   *     "conteudos": ["Definição de Engenharia de Software"],
   *     "metodologia": "Aula expositiva dialogada.",
   *     "recursos": ["Projetor"],
   *     "avaliacao": "Participação dos estudantes."
   *   }
   * }
   *
   * @param req Objeto da requisição HTTP do Express.
   * @param res Objeto da resposta HTTP do Express.
   * @returns Resposta HTTP contendo o plano final ou uma mensagem de erro.
   */
  gerarPlanoFinal = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      /**
       * Validação de entrada com Zod (sem middleware): o esquema garante que o
       * rascunho foi enviado e respeita a estrutura esperada.
       */
      const validacao = validarComEsquema(esquemaGerarPlanoFinal, req.body);

      if (!validacao.sucesso) {
        return res.status(400).json({
          sucesso: false,
          mensagem: validacao.mensagem,
          dados: null,
        });
      }

      const rascunho: PlanoDeAulaRascunho = validacao.dados.rascunho;

      /**
       * Chama a camada de serviço para gerar a versão final.
       *
       * Conforme o prompt atual, o retorno esperado é um JSON com:
       * - titulo;
       * - plano;
       * - relatorio.
       */
      const planoFinal: PlanoDeAulaFinal =
        await this.planoDeAulaServico.gerarPlanoFinal(rascunho);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Plano de aula final gerado com sucesso.',
        dados: planoFinal,
      });
    } catch (erro) {
      return this.tratarErro(res, erro);
    }
  };

  /**
   * Trata erros lançados pela camada de serviço e converte em uma resposta
   * HTTP padronizada.
   *
   * Neste estágio do projeto, as validações simples do corpo da requisição
   * retornam status 400 diretamente nos métodos do controlador.
   *
   * Erros lançados pela camada de serviço retornam status 500, pois podem
   * envolver falhas na IA, JSON inválido retornado pelo modelo ou problemas
   * de configuração.
   *
   * Futuramente, esse método pode evoluir para diferenciar melhor:
   *
   * - erro de validação;
   * - erro de integração externa;
   * - erro interno inesperado.
   *
   * @param res Objeto da resposta HTTP do Express.
   * @param erro Erro capturado no bloco try/catch.
   * @returns Resposta HTTP padronizada de erro.
   */
  private tratarErro(res: Response, erro: unknown): Response {
    const mensagem =
      erro instanceof Error
        ? erro.message
        : 'Erro interno ao processar a solicitação.';

    return res.status(500).json({
      sucesso: false,
      mensagem,
      dados: null,
    });
  }
}

export { PlanoDeAulaControlador };