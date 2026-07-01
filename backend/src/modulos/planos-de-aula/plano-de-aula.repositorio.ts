/**
 * plano-de-aula.repositorio.ts: repositório MongoDB para planos de aula final.
 *
 * Responsabilidade: encapsular a comunicação com o MongoDB.
 * O serviço (plano-de-aula.servico.ts) chama o repositório.
 * O controlador continua fino, sem conhecer detalhes de persistência.
 *
 * Regras de acordo com a especificação:
 * - Persistência não-fatal: se MONGO_URL não existir ou a gravação falhar,
 *   registra o erro (console.error) e segue sem lançar exceção.
 * - A resposta da API continua vindo da IA, NUNCA do documento do Mongoose
 *   (evita _id/__v no campo "dados" da resposta).
 */

import mongoose from 'mongoose';

import { PlanoDeAulaModelo } from './plano-de-aula.modelo';

import type { PlanoDeAulaFinal } from './plano-de-aula.servico';

/**
 * URL de conexão com o MongoDB.
 *
 * Vem da variável de ambiente MONGO_URL.
 * Se não estiver configurada, a persistência é desabilitada.
 */
const MONGO_URL = process.env.MONGO_URL || '';

/**
 * Indica se o MongoDB está conectado e pronto para gravação.
 */
let conectado = false;

/**
 * Conecta ao MongoDB se a URL estiver configurada.
 *
 * A conexão é lazy (sob demanda) para não travar a inicialização
 * do servidor quando o MongoDB não estiver disponível.
 */
async function conectarSeNecessario(): Promise<void> {
    if (conectado || !MONGO_URL) {
        return;
    }

    try {
        await mongoose.connect(MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
        });
        conectado = true;
        console.log('Conectado ao MongoDB com sucesso.');
    } catch (erro) {
        console.error(
            'Não foi possível conectar ao MongoDB. A persistência será desabilitada.',
            erro instanceof Error ? erro.message : erro,
        );
    }
}

/**
 * Salva o plano de aula final no MongoDB.
 *
 * Esta função é chamada pelo serviço APÓS a IA gerar com sucesso.
 *
 * @param planoFinal Objeto com titulo, plano e relatorio.
 *
 * Regras:
 * - Se MONGO_URL não existir, apenas loga e retorna (não falha).
 * - Se a conexão falhar, loga e retorna (não falha).
 * - Se a gravação falhar, loga e retorna (não falha).
 */
export async function salvarPlanoFinal(
    planoFinal: PlanoDeAulaFinal,
): Promise<void> {
    // Se MONGO_URL não foi configurada, desabilita persistência silenciosamente.
    if (!MONGO_URL) {
        console.log(
            'MONGO_URL não configurada. Plano final não será persistido.',
        );
        return;
    }

    await conectarSeNecessario();

    // Se não conseguiu conectar, apenas loga e segue.
    if (!conectado) {
        console.error(
            'MongoDB não disponível. Plano final não será persistido.',
        );
        return;
    }

    try {
        const documento = new PlanoDeAulaModelo({
            titulo: planoFinal.titulo,
            plano: planoFinal.plano,
            relatorio: planoFinal.relatorio,
        });

        await documento.save();

        console.log(`Plano final "${planoFinal.titulo}" salvo no MongoDB.`);
    } catch (erro) {
        console.error(
            'Erro ao salvar plano final no MongoDB:',
            erro instanceof Error ? erro.message : erro,
        );
        // Persistência não-fatal: não relança o erro.
    }
}
