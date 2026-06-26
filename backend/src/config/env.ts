import dotenv from 'dotenv';

import path from 'path';

const env = process.env.NODE_ENV ?? 'development';

dotenv.config({
    path: path.resolve(process.cwd(), `.env.${env}`)
});

export const config = {
    port: Number(process.env.PORT) ?? 3333,
    urlApi: `http://localhost:${process.env.PORT ?? 3333}`,
    nodeEnv: env,
    corsOrigin: process.env.CORS_ORIGIN ?? '*',

    /**
     * URL de conexão com o MongoDB.
     *
     * É opcional de propósito: quando ausente (string vazia), a persistência do
     * plano final é ignorada de forma não-fatal. Assim os testes e o ambiente
     * local funcionam sem um banco em execução.
     */
    mongoUrl: process.env.MONGO_URL ?? '',
};