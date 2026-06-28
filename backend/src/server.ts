import { config } from './config/env';

import app from './app';

import { setupSwagger } from './config/swagger';

import { conectarMongo } from './config/mongo';

setupSwagger(app);

// Tenta conectar ao MongoDB (se MONGO_URL estiver configurada).
conectarMongo();

app.listen(config.port, ()=>{
    console.log(`Servidor executando na porta ${config.port} (ambiente: ${config.nodeEnv})`);
    console.log(`Documentação da API disponível em /docs`);
});
