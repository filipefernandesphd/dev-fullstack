import express from 'express';

import {Request, Response} from 'express';

import { planoDeAulaRotas } from './modulos/planos-de-aula/plano-de-aula.rotas';

import cors from 'cors';

import { config } from './config/env';

import mongoose from 'mongoose';

import 'dotenv/config';

const app = express();

const MONGO_URI ="mongodb+srv://notebookifsudestemg_db_user:v7rWEWx3iZErGhgo@pos.lcyiojc.mongodb.net/meuplanoai?appName=pos"

async function iniciarServidor() {
  try {
    // 1. Tenta conectar ao MongoDB primeiro
    await mongoose.connect(MONGO_URI);
    console.log(' Conectado ao MongoDB com sucesso!');
  } catch (erro) {
    console.error(' Erro ao iniciar o servidor:', erro);
    process.exit(1); // Fecha a aplicação se não conseguir conectar ao banco
  }
}

iniciarServidor();

// Habilita o CORS antes das rotas (origem vinda de config.corsOrigin).
app.use(cors({ origin: config.corsOrigin }));

app.use(express.json());

app.get('/' , (req: Request, res: Response) => {
    return res.json({
        mensagem: 'Hello World! API MeuPlano.AI funcionando.'
    });
});

app.use('/planos-de-aula' , planoDeAulaRotas);

export default app;