import mongoose from 'mongoose';

/**
 * Indica se a conexão com o MongoDB já foi inicializada.
 *
 * Isso evita múltiplas conexões simultâneas durante o ciclo de vida
 * da aplicação (especialmente em hot reload no modo dev).
 */
let conexaoInicializada = false;

/**
 * Estabelece conexão com o MongoDB utilizando a variável de ambiente MONGO_URL.
 *
 * Regras importantes para este projeto:
 * - A conexão é opcional (não pode quebrar testes);
 * - Se MONGO_URL não existir, a aplicação segue sem persistência;
 * - Se a conexão falhar, o erro é apenas logado;
 * - O fluxo principal da API nunca deve ser interrompido por MongoDB.
 */
export async function conectarMongo(): Promise<void> {
    if (conexaoInicializada) {
        return;
    }

    const url = process.env.MONGO_URL;

    if (!url) {
        console.warn(
            '[MongoDB] MONGO_URL não configurada. Persistência desativada.',
        );
        return;
    }

    try {
        await mongoose.connect(url);

        conexaoInicializada = mongoose.connection.readyState === 1;

        if (conexaoInicializada) {
            console.info('[MongoDB] Conexão estabelecida com sucesso.');
        } else {
            console.warn(
                '[MongoDB] Conexão não foi estabelecida completamente.',
            );
        }
    } catch (erro) {
        console.error(
            '[MongoDB] Falha na conexão. A aplicação continuará sem persistência.',
            erro,
        );
    }
}