import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do mongoose no topo, antes de importar app
// Mock completo do mongoose
vi.mock('mongoose', () => {
  return {
    connect: vi.fn().mockResolvedValue({}),
    Schema: class {},   // devolve uma classe vazia para Schema
    model: vi.fn(),     // devolve uma função fake para model
  };
});

import type { PlanoDeAulaRascunho } from '../../../src/modulos/planos-de-aula/plano-de-aula.tipos';

const { gerarJsonMock } = vi.hoisted(() => {
    return { gerarJsonMock: vi.fn() };
});

vi.mock('../../../src/modulos/ia/ia.servico', () => {
    class IaServicoFalso {
        gerarJson = gerarJsonMock;
    }
    return { IaServico: IaServicoFalso };
});

import app from '../../../src/app';

const rascunhoValido: PlanoDeAulaRascunho = {
    titulo: 'Introdução à Engenharia de Software',
    disciplina: 'Engenharia de Software',
    curso: 'Graduação em Computação',
    nivel: 'Iniciante',
    duracao: '50 minutos',
    tema: 'Conceitos iniciais de Engenharia de Software',
    objetivos: [
        'Compreender o conceito de Engenharia de Software.',
        'Diferenciar desenvolvimento ad hoc de processos sistemáticos.',
    ],
    conteudos: [
        'Definição de Engenharia de Software',
        'Noções de processo de software',
    ],
    metodologia: 'Aula expositiva dialogada com exemplos de sistemas reais.',
    recursos: ['Projetor', 'Computador', 'Slides'],
    avaliacao: 'Participação dos estudantes na discussão orientada.',
};

describe('POST /planos-de-aula/final', () => {
    beforeEach(() => {
        gerarJsonMock.mockReset();
    });

    it('deve gerar a versão final do plano de aula a partir do rascunho revisado', async () => {
        const planoFinalGeradoPelaIa = {
            titulo: rascunhoValido.titulo,
            plano: rascunhoValido,
            relatorio:
                'Plano de Aula: Introdução à Engenharia de Software\n\n' +
                'Disciplina: Engenharia de Software\nDuração: 50 minutos\n\n' +
                'Este plano descreve uma única aula introdutória sobre os conceitos ' +
                'fundamentais da Engenharia de Software.',
        };

        gerarJsonMock.mockResolvedValue(planoFinalGeradoPelaIa);

        const resposta = await request(app)
            .post('/planos-de-aula/final')
            .send({ rascunho: rascunhoValido });

        expect(resposta.status).toBe(200);
        expect(resposta.body).toEqual({
            sucesso: true,
            mensagem: 'Plano de aula final gerado com sucesso.',
            dados: planoFinalGeradoPelaIa,
        });
        expect(gerarJsonMock).toHaveBeenCalledTimes(1);
    });

    it('deve retornar erro 400 quando o rascunho não for enviado', async () => {
        const resposta = await request(app)
            .post('/planos-de-aula/final')
            .send({});

        expect(resposta.status).toBe(400);
        expect(resposta.body).toEqual({
            sucesso: false,
            mensagem: 'O rascunho do plano de aula é obrigatório.',
            dados: null,
        });
        expect(gerarJsonMock).not.toHaveBeenCalled();
    });

    it('deve retornar erro 500 quando o serviço de IA falhar', async () => {
        gerarJsonMock.mockRejectedValue(new Error('Falha simulada na IA.'));

        const resposta = await request(app)
            .post('/planos-de-aula/final')
            .send({ rascunho: rascunhoValido });

        expect(resposta.status).toBe(500);
        expect(resposta.body).toEqual({
            sucesso: false,
            mensagem: 'Falha simulada na IA.',
            dados: null,
        });
    });
});