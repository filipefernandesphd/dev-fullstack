/**
 * plano-de-aula.modelo.ts: schema e modelo Mongoose para o plano de aula final.
 *
 * Este modelo é usado APENAS para persistência no MongoDB (repositório).
 * O contrato da API (resposta HTTP) continua usando os tipos planos
 * definidos em plano-de-aula.tipos.ts — jamais devolvemos documentos
 * do Mongoose diretamente na resposta.
 */

import { Schema, model } from 'mongoose';

import type { PlanoDeAulaRascunho } from './plano-de-aula.tipos';

/**
 * Schema do rascunho embutido no documento do plano final.
 *
 * Corresponde exatamente ao tipo PlanoDeAulaRascunho.
 * Usamos subdocumento (não referência) porque o plano final
 * é uma "fotografia" do rascunho no momento da geração.
 */
const rascunhoSchema = new Schema<PlanoDeAulaRascunho>(
    {
        titulo: { type: String, required: true },
        disciplina: { type: String, required: true },
        curso: { type: String, required: true },
        nivel: { type: String, required: true },
        duracao: { type: String, required: true },
        tema: { type: String, required: true },
        objetivos: { type: [String], required: true },
        conteudos: { type: [String], required: true },
        metodologia: { type: String, required: true },
        recursos: { type: [String], required: true },
        avaliacao: { type: String, required: true },
    },
    {
        /**
         * _id: false evita que o subdocumento ganhe um _id próprio,
         * mantendo o documento mais limpo.
         */
        _id: false,
    },
);

/**
 * Schema do documento de plano de aula final no MongoDB.
 *
 * Campos:
 * - titulo: título principal do plano final;
 * - plano: cópia do rascunho no momento da finalização;
 * - relatorio: texto do relatório gerado pela IA;
 * - criadoEm: timestamp automático (gerenciado pelo Mongoose).
 */
const planoDeAulaSchema = new Schema(
    {
        titulo: { type: String, required: true },
        plano: { type: rascunhoSchema, required: true },
        relatorio: { type: String, required: true },
    },
    {
        /**
         * timestamps: true adiciona createdAt e updatedAt automaticamente.
         */
        timestamps: { createdAt: 'criadoEm', updatedAt: false },
    },
);

/**
 * Modelo Mongoose para a coleção "plano_de_aulas".
 *
 * O nome da coleção no plural segue a convenção do Mongoose.
 */
export const PlanoDeAulaModelo = model('PlanoDeAula', planoDeAulaSchema);
