import mongoose, { Schema } from 'mongoose';

import type { PlanoDeAulaFinal } from './plano-de-aula.servico';

/**
 * Schema Mongoose que representa um plano de aula final persistido.
 *
 * Armazena:
 * - titulo: título principal do plano;
 * - plano: objeto estruturado com os campos do rascunho;
 * - relatorio: texto do relatório gerado pela IA;
 * - timestamps: data de criação e atualização.
 */
const PlanoDeAulaSchema = new Schema(
    {
        titulo: {
            type: String,
            required: true,
        },
        plano: {
            type: Object,
            required: true,
        },
        relatorio: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'planos_de_aula',
    },
);

/**
 * Modelo Mongoose para planos de aula finais.
 */
const PlanoDeAulaModel = mongoose.model('PlanoDeAula', PlanoDeAulaSchema);

/**
 * Persiste o plano de aula final no MongoDB.
 *
 * @param planoFinal Objeto retornado pela IA contendo titulo, plano e relatorio.
 * @returns O documento persistido.
 */
export async function salvarPlanoFinal(
    planoFinal: PlanoDeAulaFinal,
): Promise<void> {
    const documento = new PlanoDeAulaModel({
        titulo: planoFinal.titulo,
        plano: planoFinal.plano,
        relatorio: planoFinal.relatorio,
    });

    await documento.save();
}
