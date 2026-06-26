import { config } from './config/env';

import app from './app';

import { setupSwagger } from './config/swagger';

import { conectarMongo } from './config/mongo';

setupSwagger(app);

/**
 * Conectar ao MongoDB já na inicialização, para que a primeira
 * gravação não pague o custo de abrir a conexão.
 *
 * A conexão é guardada por MONGO_URL (não faz nada sem a variável). Se falhar,
 * apenas registra o erro e segue: o servidor sobe normalmente e a
 * persistência permanece não-fatal.
 */
conectarMongo().catch((erro) => {
    console.error('Não foi possível conectar ao MongoDB na inicialização:', erro);
});

app.listen(config.port, ()=>{
    console.log(`Servidor executando em ${config.urlApi} (ambiente: ${config.nodeEnv})`);
    console.log(`Documentação da API disponível em ${config.urlApi}/docs`);
});
