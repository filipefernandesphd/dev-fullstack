import { Router } from 'express'; 
import { PlanoDeAulaControlador } from './plano-de-aula.controlador';

const planoDeAulaRotas = Router();
const planoDeAulaControlador = new PlanoDeAulaControlador();

// POST /planos-de-aula/rascunho
planoDeAulaRotas.post(
    '/rascunho',
    planoDeAulaControlador.gerarRascunho.bind(planoDeAulaControlador)
);

// POST /planos-de-aula/rascunho/melhorar
planoDeAulaRotas.post(
    '/rascunho/melhorar',
    planoDeAulaControlador.melhorarRascunho.bind(planoDeAulaControlador)
);

// POST /planos-de-aula/final
planoDeAulaRotas.post(
    '/final',
    planoDeAulaControlador.gerarPlanoFinal.bind(planoDeAulaControlador)
);

// GET /planos-de-aula
planoDeAulaRotas.get(
    '/', 
    planoDeAulaControlador.listarPlanos.bind(planoDeAulaControlador)
);

// GET /planos-de-aula/:id
planoDeAulaRotas.get(
    '/:id', 
    planoDeAulaControlador.buscarPlano.bind(planoDeAulaControlador)
);

export { planoDeAulaRotas };