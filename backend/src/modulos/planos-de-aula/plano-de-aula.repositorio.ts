import mongoose, { Schema } from 'mongoose';
import type { PlanoDeAulaRascunho } from './plano-de-aula.tipos';

/**
 * Representa o documento salvo no MongoDB.
 *
 * Regra importante:
 * - NÃO depende do serviço
 * - NÃO contém regra de negócio
 * - apenas estrutura de persistência
 */
type PlanoDeAulaDocumento = {
    titulo: string;
    plano: PlanoDeAulaRascunho;
    relatorio: string;
    criadoEm: Date;
};

/**
 * Schema do MongoDB para planos de aula.
 *
 * Mantido simples para não afetar testes nem validações externas.
 */
const PlanoDeAulaSchema = new Schema<PlanoDeAulaDocumento>({
    titulo: { type: String, required: true },
    plano: { type: Object, required: true },
    relatorio: { type: String, required: true },
    criadoEm: { type: Date, default: Date.now },
});

/**
 * IMPORTANTE (hot reload / CI / testes):
 *
 * Evita erro de OverwriteModelError no Mongoose.
 * Isso acontece em:
 * - tsx watch
 * - testes automatizados
 * - hot reload do Node
 */
const PlanoDeAulaModel =
    mongoose.models.PlanoDeAula ||
    mongoose.model<PlanoDeAulaDocumento>('PlanoDeAula', PlanoDeAulaSchema);

/**
 * Repositório responsável pela persistência de planos de aula.
 *
 * REGRA CRÍTICA DO PROJETO:
 * - nunca pode quebrar endpoint /planos-de-aula/final
 * - falha de MongoDB é sempre não-fatal
 * - erro apenas logado
 */
class PlanoDeAulaRepositorio {
    /**
     * Salva o plano final no MongoDB.
     *
     * ⚠️ Nunca lança erro (não pode quebrar testes nem API)
     */
    async salvar(plano: {
        titulo: string;
        plano: PlanoDeAulaRascunho;
        relatorio: string;
    }): Promise<void> {
        try {
            await PlanoDeAulaModel.create({
                titulo: plano.titulo,
                plano: plano.plano,
                relatorio: plano.relatorio,
                criadoEm: new Date(),
            });
        } catch (erro) {
            console.error(
                '[MongoDB] Erro ao salvar plano de aula (não crítico):',
                erro,
            );
        }
    }

    /**
     * Lista todos os planos (uso opcional para debug/admin).
     */
    async listar(): Promise<PlanoDeAulaDocumento[]> {
        try {
            return await PlanoDeAulaModel.find().lean();
        } catch (erro) {
            console.error('[MongoDB] Erro ao listar planos:', erro);
            return [];
        }
    }
}

export const planoDeAulaRepositorio = new PlanoDeAulaRepositorio();