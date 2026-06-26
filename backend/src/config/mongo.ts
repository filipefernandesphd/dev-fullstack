import mongoose from 'mongoose';

import { config } from './env';

/**
 * Conexão com o MongoDB usando Mongoose.
 *
 * - A conexão é GUARDADA por MONGO_URL: se a variável não existir, não tenta
 *   conectar. Isso permite que os testes e o ambiente local rodem sem MongoDB.
 *
 * - A conexão é IDEMPOTENTE: chamar conectarMongo() várias vezes não abre
 *   conexões duplicadas; se já está conectado (ou conectando), retorna.
 *
 * - O módulo NÃO conecta sozinho ao ser importado: quem decide o momento de
 *   conectar é quem chama a função. Isso evita efeitos colaterais no import
 *   (fundamental para não quebrar os testes, que importam a cadeia inteira).
 */

/**
 * Conecta ao MongoDB de forma idempotente e guardada por MONGO_URL.
 *
 * @returns Uma Promise que resolve quando a conexão estiver pronta (ou
 *          imediatamente, caso não haja MONGO_URL ou já estejamos conectados).
 *
 * @throws Error Caso a conexão falhe. Cabe a quem chama decidir se trata o erro
 *               de forma fatal (servidor) ou não-fatal (repositório).
 */
export async function conectarMongo(): Promise<void> {
    /**
     * Sem MONGO_URL não há o que conectar. Retorna em silêncio para que o
     * fluxo continue normalmente (a persistência será simplesmente ignorada).
     */
    if (!config.mongoUrl) {
        return;
    }

    /**
     * readyState do Mongoose:
     *   0 = desconectado
     *   1 = conectado
     *   2 = conectando
     *   3 = desconectando
     *
     * Se já está conectado (1) ou conectando (2), não faz nada.
     */
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        return;
    }

    /**
     * serverSelectionTimeoutMS limita quanto espera para encontrar um
     * servidor disponível antes de falhar. O padrão do Mongoose é 30s, alto
     * demais: se o banco estiver fora do ar, prefere-se falhar rápido (5s) e
     * deixar a persistência não-fatal seguir sem travar a requisição.
     */
    await mongoose.connect(config.mongoUrl, {
        serverSelectionTimeoutMS: 5_000,
    });
}
