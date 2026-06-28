import mongoose from 'mongoose';

/**
 * Conecta ao MongoDB apenas se a variável de ambiente MONGO_URL estiver definida.
 *
 * Sem MONGO_URL, a função não faz nada. Isso é importante para:
 *
 * - ambientes de teste que não precisam de banco;
 * - execuções locais em que o desenvolvedor optou por não subir o MongoDB.
 *
 * A conexão é reaproveitada pelo Mongoose em chamadas subsequentes.
 */
export async function conectarMongo(): Promise<void> {
    const url = process.env.MONGO_URL;

    if (!url || url.trim().length === 0) {
        console.log('[MongoDB] MONGO_URL não configurada — persistência desabilitada.');
        return;
    }

    if (mongoose.connection.readyState === 1) {
        console.log('[MongoDB] Já conectado.');
        return;
    }

    try {
        await mongoose.connect(url);
        console.log('[MongoDB] Conectado com sucesso.');
    } catch (erro) {
        console.error('[MongoDB] Falha na conexão:', erro instanceof Error ? erro.message : erro);
        throw erro;
    }
}
