import { config } from './config/env';

import app from './app';

import { setupSwagger } from './config/swagger';

import { conectarMongo } from './config/mongo';

setupSwagger(app);

async function start() {
    await conectarMongo();

    app.listen(config.port, () => {
        console.log(`Servidor executando em ${config.urlApi} (ambiente: ${config.nodeEnv})`);
        console.log(`Documentação da API disponível em ${config.urlApi}/docs`);
    });
}

start();