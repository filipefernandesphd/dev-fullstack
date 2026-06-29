import { config } from './config/env';

import { conectarMongo } from './config/banco-de-dados';

import app from './app';

import { setupSwagger } from './config/swagger';

setupSwagger(app);

/**
 * Tenta conectar ao MongoDB antes de iniciar o servidor.
 * Se a variável MONGO_URL não estiver definida ou a conexão falhar,
 * o servidor inicia normalmente — apenas sem persistência.
 */
conectarMongo().then(() => {
    app.listen(config.port, ()=>{
        console.log(`Servidor executando em ${config.urlApi} (ambiente: ${config.nodeEnv})`);
        console.log(`Documentação da API disponível em ${config.urlApi}/docs`);
    });
});
