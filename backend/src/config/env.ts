import dotenv from 'dotenv';

import path from 'path';

const env = process.env.NODE_ENV ?? 'development';

dotenv.config({
    path: path.resolve(process.cwd(), `.env.${env}`)
});

const port = Number(process.env.PORT) ?? 3333;

export const config = {
    port,
    urlApi: process.env.API_URL ?? `http://localhost:${port}`,
    nodeEnv: env,
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
};
