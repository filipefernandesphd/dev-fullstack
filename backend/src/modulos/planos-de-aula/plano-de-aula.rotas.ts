import { Router } from 'express'; 

import { PlanoDeAulaControlador } from './plano-de-aula-controlador'

const planoDeAulaRotas = Router();

const planoDeAulaControlador = new PlanoDeAulaControlador();

// POST /planos-de-aula/rascunho
planoDeAulaRotas.post(
    '/rascunho',
    planoDeAulaControlador.gerarRascunho
);

// POST /planos-de-aula/rascunho/melhorar
planoDeAulaRotas.post(
    '/rascunho/melhorar',
    planoDeAulaControlador.melhorarRascunho
);

// POST /planos-de-aula/final
planoDeAulaRotas.post(
    '/final',
    planoDeAulaControlador.gerarPlanoFinal
);

export { planoDeAulaRotas };