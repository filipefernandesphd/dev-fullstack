import { config } from './config/env';
import app from './app';
import { setupSwagger } from './config/swagger';
import mongoose from 'mongoose';

/**
 * Inicializa a conexão com o banco de dados MongoDB de forma não-fatal.
 * * Se a variável MONGO_URL não estiver configurada ou se a conexão falhar,
 * o sistema registra o ocorrido nos logs e permite que o servidor continue rodando
 * normalmente, garantindo a resiliência exigida pelo projeto didático.
 */
async function conectarBancoDados(): Promise<void> {
    // A string de conexão é lida a partir do arquivo central de configurações de ambiente
    const urlConexao = process.env.MONGO_URL;

    if (!urlConexao) {
        console.warn(
            'Aviso de Infraestrutura: Variável MONGO_URL não encontrada no ambiente. O servidor operará sem persistência no MongoDB.'
        );
        return;
    }

    try {
        await mongoose.connect(urlConexao);
        console.log('Sucesso: Conexão com o MongoDB estabelecida com êxito.');
    } catch (erro: any) {
        console.error(
            `Erro de conexão não-fatal no MongoDB: ${erro.message}. O servidor continuará ativo para requisições.`
        );
    }
}

/**
 * Orquestra a inicialização completa do ecossistema do backend.
 * Garante que a infraestrutura de dados seja acionada antes de abrir as portas para o tráfego.
 */
async function inicializarAplicacao(): Promise<void> {
    // 1. Tenta estabelecer conexão com o MongoDB de forma segura e não-bloqueante
    await conectarBancoDados();

    // 2. Configura a documentação Swagger na instância do Express
    setupSwagger(app);

    // 3. Ativa o escutador do servidor Express na porta configurada
    app.listen(config.port, () => {
        console.log(`Servidor executando em ${config.urlApi} (ambiente: ${config.nodeEnv})`);
        console.log(`Documentação da API disponível em ${config.urlApi}/docs`);
    });
}

// Dispara o fluxo de inicialização do backend
inicializarAplicacao();