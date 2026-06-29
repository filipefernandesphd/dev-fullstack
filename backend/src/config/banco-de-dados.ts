/**
 * Módulo responsável pela conexão com o banco de dados MongoDB.
 *
 * A conexão é opcional e controlada pela variável de ambiente MONGO_URL.
 * Se a variável não estiver configurada, o sistema funciona normalmente
 * sem persistência — isso garante que os testes passem sem MongoDB.
 *
 * Usa o Mongoose como ODM (Object-Document Mapper).
 */
import mongoose from 'mongoose';

/**
 * Indica se a conexão com o MongoDB foi estabelecida com sucesso.
 *
 * Essa flag é consultada pelo repositório antes de tentar gravar,
 * evitando erros desnecessários quando o banco não está disponível.
 */
let mongoConectado = false;

/**
 * Tenta conectar ao MongoDB usando a URL da variável de ambiente MONGO_URL.
 *
 * Se MONGO_URL não estiver definida, apenas loga um aviso e segue sem
 * conexão (persistência desabilitada).
 *
 * Se a conexão falhar, loga o erro e segue sem derrubar a aplicação
 * (persistência não-fatal).
 */
async function conectarMongo(): Promise<void> {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
        console.warn(
            '[MongoDB] Variável MONGO_URL não configurada. Persistência desabilitada.',
        );
        return;
    }

    try {
        await mongoose.connect(mongoUrl);
        mongoConectado = true;
        console.log('[MongoDB] Conectado com sucesso.');
    } catch (erro) {
        console.error('[MongoDB] Falha ao conectar:', erro);
        mongoConectado = false;
    }
}

/**
 * Retorna se o MongoDB está conectado e pronto para uso.
 *
 * @returns true se a conexão foi estabelecida com sucesso.
 */
function estaConectado(): boolean {
    return mongoConectado;
}

export { conectarMongo, estaConectado };
