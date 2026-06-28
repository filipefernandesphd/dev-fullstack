import { config } from './config/env';

import app from './app';

import { setupSwagger } from './config/swagger';

import { conectarMongo } from './config/mongo';

setupSwagger(app);

// Tenta conectar ao MongoDB (se MONGO_URL estiver configurada).
// Usa .catch() para logar erros sem bloquear o startup do servidor.
conectarMongo().catch((erro) => {
    console.error('[Servidor] Falha ao conectar ao MongoDB:', erro instanceof Error ? erro.message : erro);
});

app.listen(config.port, ()=>{
    console.log(`Servidor executando em ${config.urlApi} (ambiente: ${config.nodeEnv})`);
    console.log(`Documentação da API disponível em ${config.urlApi}/docs`);
});
