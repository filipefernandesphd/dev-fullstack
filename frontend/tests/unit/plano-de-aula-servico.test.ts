// plano-de-aula.servico.test.ts: testes do cliente HTTP do frontend.
//
// Não queremos chamar a API real nos testes. Por isso "dublamos" (mock) a função
// global `fetch`, controlando exatamente o que ela responde em cada caso.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { PlanoDeAulaServico } from '../../src/modulos/planos-de-aula/plano-de-aula.servico';
import type { PlanoDeAulaRascunho } from '../../src/modulos/planos-de-aula/plano-de-aula.tipos';

// URL base fixa, injetada no serviço, para podermos verificar a URL chamada.
const URL_BASE = 'http://api.test';

// Cria o serviço já apontando para a URL de teste.
const servico = new PlanoDeAulaServico(URL_BASE);

// Mock da função global fetch.
const fetchMock = vi.fn();

/**
 * Helper que monta uma resposta semelhante à do fetch (objeto Response).
 *
 * @param ok Indica se a resposta HTTP foi bem-sucedida.
 * @param corpo Objeto que será devolvido por resposta.json().
 */
function criarResposta(ok: boolean, corpo: unknown) {
  return {
    ok,
    json: async () => corpo,
  };
}

// Rascunho válido reutilizado nos testes.
const rascunhoValido: PlanoDeAulaRascunho = {
  titulo: 'Introdução à Engenharia de Software',
  disciplina: 'Engenharia de Software',
  curso: 'Graduação em Computação',
  nivel: 'Iniciante',
  duracao: '50 minutos',
  tema: 'Conceitos iniciais de Engenharia de Software',
  objetivos: ['Compreender o conceito.', 'Diferenciar abordagens.'],
  conteudos: ['Definição', 'Processo de software'],
  metodologia: 'Aula expositiva dialogada.',
  recursos: ['Projetor', 'Computador'],
  avaliacao: 'Participação dos estudantes.',
};

describe('PlanoDeAulaServico', () => {
  beforeEach(() => {
    // Substitui a fetch global pelo mock antes de cada teste.
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();   // vi.unstubAllGlobals() desfaz todos os globais que foram substituídos
  });

  describe('gerarRascunho', () => {
    it('deve enviar a descrição e retornar o rascunho gerado', async () => {
      fetchMock.mockResolvedValue(
        criarResposta(true, {
          sucesso: true,
          mensagem: 'Rascunho do plano de aula gerado com sucesso.',
          dados: rascunhoValido,
        }),
      );

      const resultado = await servico.gerarRascunho('Quero uma aula sobre IA.');

      // Retornou apenas o conteúdo de "dados".
      expect(resultado).toEqual(rascunhoValido);

      // Chamou o endpoint correto, com método POST e a descrição no corpo.
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, opcoes] = fetchMock.mock.calls[0];
      expect(url).toBe(`${URL_BASE}/planos-de-aula/rascunho`);
      expect(opcoes.method).toBe('POST');
      expect(JSON.parse(opcoes.body)).toEqual({
        descricao: 'Quero uma aula sobre IA.',
      });
    });

    it('deve lançar erro com a mensagem da API quando a resposta falhar', async () => {
      fetchMock.mockResolvedValue(
        criarResposta(false, {
          sucesso: false,
          mensagem: 'A descrição deve ter pelo menos 10 caracteres.',
        }),
      );

      await expect(servico.gerarRascunho('curta')).rejects.toThrow(
        'A descrição deve ter pelo menos 10 caracteres.',
      );
    });
  });

  describe('melhorarRascunho', () => {
    it('deve enviar o rascunho e as orientações e retornar o rascunho melhorado', async () => {
      const rascunhoMelhorado = {
        ...rascunhoValido,
        metodologia: 'Aula com atividade prática em grupo.',
      };

      fetchMock.mockResolvedValue(
        criarResposta(true, {
          sucesso: true,
          mensagem: 'Rascunho do plano de aula melhorado com sucesso.',
          dados: rascunhoMelhorado,
        }),
      );

      const resultado = await servico.melhorarRascunho(
        rascunhoValido,
        'Deixe a metodologia mais ativa.',
      );

      expect(resultado).toEqual(rascunhoMelhorado);

      const [url, opcoes] = fetchMock.mock.calls[0];
      expect(url).toBe(`${URL_BASE}/planos-de-aula/rascunho/melhorar`);
      expect(opcoes.method).toBe('POST');
      expect(JSON.parse(opcoes.body)).toEqual({
        rascunho: rascunhoValido,
        orientacoes: 'Deixe a metodologia mais ativa.',
      });
    });

    it('deve lançar erro com a mensagem da API quando a resposta falhar', async () => {
      fetchMock.mockResolvedValue(
        criarResposta(false, {
          sucesso: false,
          mensagem: 'As orientações para melhoria do rascunho são obrigatórias.',
        }),
      );

      await expect(
        servico.melhorarRascunho(rascunhoValido, ''),
      ).rejects.toThrow(
        'As orientações para melhoria do rascunho são obrigatórias.',
      );
    });
  });

  describe('gerarPlanoFinal', () => {
    it('deve enviar o rascunho e retornar o plano final', async () => {
      const planoFinal = {
        titulo: rascunhoValido.titulo,
        plano: rascunhoValido,
        relatorio: 'Plano de Aula: Introdução à Engenharia de Software...',
      };

      fetchMock.mockResolvedValue(
        criarResposta(true, {
          sucesso: true,
          mensagem: 'Plano de aula final gerado com sucesso.',
          dados: planoFinal,
        }),
      );

      const resultado = await servico.gerarPlanoFinal(rascunhoValido);

      expect(resultado).toEqual(planoFinal);

      const [url, opcoes] = fetchMock.mock.calls[0];
      expect(url).toBe(`${URL_BASE}/planos-de-aula/final`);
      expect(opcoes.method).toBe('POST');
      expect(JSON.parse(opcoes.body)).toEqual({ rascunho: rascunhoValido });
    });

    it('deve lançar erro com a mensagem da API quando a resposta falhar', async () => {
      fetchMock.mockResolvedValue(
        criarResposta(false, {
          sucesso: false,
          mensagem: 'O rascunho do plano de aula é obrigatório.',
        }),
      );

      await expect(servico.gerarPlanoFinal(rascunhoValido)).rejects.toThrow(
        'O rascunho do plano de aula é obrigatório.',
      );
    });
  });
});