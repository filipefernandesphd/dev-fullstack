// fluxo-principal.test.tsx: teste de integração do fluxo principal completo.
//
// Percorre os 7 passos do caso de uso na interface:
//   digitar a descrição -> gerar rascunho -> revisar -> gerar versão final ->
//   ver o relatório.
//
// Não chamamos a API real: "dublamos" (mock) a camada de serviço
// (plano-de-aula.servico), controlando o que cada método retorna.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Cria os mocks ANTES das importações (vi.mock é içado para o topo).
const { gerarRascunhoMock, melhorarRascunhoMock, gerarPlanoFinalMock } =
  vi.hoisted(() => {
    return {
      gerarRascunhoMock: vi.fn(),
      melhorarRascunhoMock: vi.fn(),
      gerarPlanoFinalMock: vi.fn(),
    };
  });

// Substitui o módulo do serviço por uma versão dublada.
vi.mock('../../src/modulos/planos-de-aula/plano-de-aula.servico', () => {
  return {
    planoDeAulaServico: {
      gerarRascunho: gerarRascunhoMock,
      melhorarRascunho: melhorarRascunhoMock,
      gerarPlanoFinal: gerarPlanoFinalMock,
    },
  };
});

// Importa o App já com o serviço dublado.
import App from '../../src/App';
import type { PlanoDeAulaRascunho } from '../../src/modulos/planos-de-aula/plano-de-aula.tipos';

// Rascunho que a IA "vai responder".
const rascunho: PlanoDeAulaRascunho = {
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

describe('Fluxo principal', () => {
  beforeEach(() => {
    gerarRascunhoMock.mockReset();
    melhorarRascunhoMock.mockReset();
    gerarPlanoFinalMock.mockReset();
  });

  it('gera o rascunho, permite revisar e gera a versão final em relatório', async () => {
    const usuario = userEvent.setup();

    // Define as respostas dubladas do serviço.
    gerarRascunhoMock.mockResolvedValue(rascunho);
    gerarPlanoFinalMock.mockResolvedValue({
      titulo: rascunho.titulo,
      plano: rascunho,
      relatorio: 'RELATORIO FINAL DA AULA',
    });

    render(<App />);

    // Passos 2-3: descreve e gera o plano.
    await usuario.type(
      screen.getByLabelText(/descrição do plano de aula/i),
      'Quero uma aula sobre introdução à engenharia de software.',
    );
    await usuario.click(screen.getByRole('button', { name: 'Gerar plano' }));

    // Passos 4-5: o formulário aparece com os campos preenchidos.
    expect(await screen.findByLabelText('Título')).toHaveValue(rascunho.titulo);
    expect(screen.getByLabelText('Disciplina')).toHaveValue(rascunho.disciplina);

    // O serviço de rascunho foi chamado com a descrição digitada.
    expect(gerarRascunhoMock).toHaveBeenCalledTimes(1);
    expect(gerarRascunhoMock).toHaveBeenCalledWith(
      'Quero uma aula sobre introdução à engenharia de software.',
    );

    // Passo 6: gera a versão final.
    await usuario.click(
      screen.getByRole('button', { name: 'Gerar versão final' }),
    );

    // Passo 7: o relatório final é exibido, com os dados do plano e o texto.
    expect(await screen.findByText('RELATORIO FINAL DA AULA')).toBeInTheDocument();
    expect(screen.getByText('Engenharia de Software')).toBeInTheDocument();
    expect(gerarPlanoFinalMock).toHaveBeenCalledTimes(1);
    expect(gerarPlanoFinalMock).toHaveBeenCalledWith(rascunho);
  });

  it('melhora o rascunho a partir de orientações adicionais', async () => {
    const usuario = userEvent.setup();

    // Primeiro a IA devolve o rascunho inicial; depois, o rascunho melhorado.
    gerarRascunhoMock.mockResolvedValue(rascunho);
    const rascunhoMelhorado: PlanoDeAulaRascunho = {
      ...rascunho,
      titulo: 'Engenharia de Software na Prática',
    };
    melhorarRascunhoMock.mockResolvedValue(rascunhoMelhorado);

    render(<App />);

    // Gera o rascunho inicial.
    await usuario.type(
      screen.getByLabelText(/descrição do plano de aula/i),
      'Quero uma aula sobre engenharia de software.',
    );
    await usuario.click(screen.getByRole('button', { name: 'Gerar plano' }));

    // Aguarda o formulário e confere o título inicial.
    expect(await screen.findByLabelText('Título')).toHaveValue(rascunho.titulo);

    // Informa orientações e clica em "Melhorar plano".
    await usuario.type(
      screen.getByLabelText(/orientações para melhorar o plano/i),
      'Inclua uma atividade prática.',
    );
    await usuario.click(screen.getByRole('button', { name: 'Melhorar plano' }));

    // O serviço de melhoria foi chamado com o rascunho e as orientações.
    expect(melhorarRascunhoMock).toHaveBeenCalledTimes(1);
    expect(melhorarRascunhoMock).toHaveBeenCalledWith(
      rascunho,
      'Inclua uma atividade prática.',
    );

    // O formulário continua na tela, agora com o título melhorado.
    expect(await screen.findByLabelText('Título')).toHaveValue(
      'Engenharia de Software na Prática',
    );

    // Não avançou para o relatório (nenhuma versão final foi gerada).
    expect(gerarPlanoFinalMock).not.toHaveBeenCalled();
  });
});