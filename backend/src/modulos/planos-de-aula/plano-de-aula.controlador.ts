// Importações necessárias para o controlador
import { Request, Response } from 'express';

// Importação do serviço de planos de aula
import { PlanoDeAulaServico, type PlanoDeAulaFinal } from './plano-de-aula.servico';

// Importação do rascunho do plano de aula
import type { PlanoDeAulaRascunho } from './plano-de-aula.tipos';

// Importação dos esquemas de validação (Zod) e do utilitário que os executa.
import {
  esquemaGerarRascunho,
  esquemaMelhorarRascunho,
  esquemaGerarPlanoFinal,
  validarComEsquema,
} from './plano-de-aula.validacao'

/**
 * Controlador responsável por receber as requisições HTTP relacionadas
 * ao módulo de planos de aula.
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
   */
  gerarRascunho = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const validacao = validarComEsquema(esquemaGerarRascunho, req.body);

      if (!validacao.sucesso) {
        return res.status(400).json({
          sucesso: false,
          mensagem: validacao.mensagem,
        });
      }

      const { descricao } = validacao.dados;

      const rascunho = await this.planoDeAulaServico.gerarRascunho(descricao);

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
   * Melhora um rascunho de plano de aula já existente.
   */
  melhorarRascunho = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
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
   * Gera a versão final do plano de aula
   * 
   * POST /planos-de-aula/final
   * 
   * Body: { rascunhoRevisado: PlanoDeAulaRascunho, sessaoId: string }
   */
  async gerarPlanoFinal(req: Request, res: Response): Promise<void> {
    try {
      // ACEITA AMBOS: rascunhoRevisado (novo) ou rascunho (antigo, para testes)
      const rascunhoRevisado = req.body.rascunhoRevisado || req.body.rascunho;
      const sessaoId = req.body.sessaoId;

      if (!rascunhoRevisado) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'O rascunho do plano de aula é obrigatório.',
          dados: null
        });
        return;
      }

      const planoFinal = await this.planoDeAulaServico.gerarPlanoFinal(
        rascunhoRevisado,
        sessaoId
      );

      res.status(200).json({
        sucesso: true,
        mensagem: 'Plano de aula final gerado com sucesso.',
        dados: planoFinal
      });
    } catch (erro) {
      console.error('Erro ao gerar plano final:', erro);
      res.status(500).json({
        sucesso: false,
        mensagem: erro instanceof Error ? erro.message : 'Erro ao gerar plano final',
        dados: null
      });
    }
  }

  /**
   * Trata erros lançados pela camada de serviço.
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

  /**
 * Lista todos os planos de aula de uma sessão
 * 
 * GET /planos-de-aula
 * 
 * Query: ?sessaoId=...
 */
  async listarPlanos(req: Request, res: Response): Promise<void> {
    try {
      const sessaoIdQuery = req.query.sessaoId;

      // FORÇA a conversão para string
      const sessaoIdStr: string = typeof sessaoIdQuery === 'string'
        ? sessaoIdQuery
        : Array.isArray(sessaoIdQuery) && sessaoIdQuery.length > 0
          ? String(sessaoIdQuery[0])
          : '';

      if (!sessaoIdStr) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'Identificador de sessão é obrigatório',
          dados: null
        });
        return;
      }

      const planos = await this.planoDeAulaServico.listarPlanos(sessaoIdStr);

      res.status(200).json({
        sucesso: true,
        mensagem: 'Planos recuperados com sucesso',
        dados: planos
      });
    } catch (erro) {
      console.error('Erro ao listar planos:', erro);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao recuperar planos salvos',
        dados: null
      });
    }
  }


  /**
  * Busca um plano específico pelo ID
  * 
  * GET /planos-de-aula/:id
  * 
  * Query: ?sessaoId=...
  */
  async buscarPlano(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const sessaoIdQuery = req.query.sessaoId;

      // FORÇA a conversão do id para string
      const idStr: string = typeof id === 'string' ? id : String(id);

      if (!idStr) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'ID do plano é obrigatório',
          dados: null
        });
        return;
      }

      // FORÇA a conversão do sessaoId para string
      const sessaoIdStr: string = typeof sessaoIdQuery === 'string'
        ? sessaoIdQuery
        : Array.isArray(sessaoIdQuery) && sessaoIdQuery.length > 0
          ? String(sessaoIdQuery[0])
          : '';

      if (!sessaoIdStr) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'Identificador de sessão é obrigatório',
          dados: null
        });
        return;
      }

      // Agora usa as duas variáveis já convertidas
      const plano = await this.planoDeAulaServico.buscarPlanoPorId(idStr, sessaoIdStr);

      if (!plano) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Plano não encontrado',
          dados: null
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        mensagem: 'Plano recuperado com sucesso',
        dados: plano
      });
    } catch (erro) {
      console.error('Erro ao buscar plano:', erro);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao recuperar plano',
        dados: null
      });
    }
  }
}

export { PlanoDeAulaControlador };