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
        return;
    }

    if (mongoose.connection.readyState === 1) {
        return;
    }

    await mongoose.connect(url);
}
