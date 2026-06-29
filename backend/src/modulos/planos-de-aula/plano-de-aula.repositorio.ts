/**
 * Repositório responsável pela persistência dos planos de aula no MongoDB.
 *
 * Segue a separação de camadas do projeto:
 *   rota → controlador → serviço → repositório
 *
 * O serviço chama o repositório; o repositório lida com o Mongoose.
 * O controlador e o serviço não conhecem detalhes do banco de dados.
 *
 * A persistência é não-fatal e guardada pela variável MONGO_URL:
 * - Se MONGO_URL não existir, o repositório não tenta gravar.
 * - Se a gravação falhar, o erro é registrado em log e a requisição
 *   segue normalmente (o professor recebe o plano mesmo assim).
 */
import mongoose, { Schema, type Document } from 'mongoose';

import { estaConectado } from '../../config/banco-de-dados';

import type { PlanoDeAulaRascunho } from './plano-de-aula.tipos';

/**
 * Interface que representa o documento do plano de aula final no MongoDB.
 *
 * Estende Document do Mongoose para incluir os campos específicos do domínio.
 */
interface PlanoDeAulaDocumento extends Document {
    /** Título principal do plano de aula. */
    titulo: string;

    /** Dados estruturados do plano de aula (mesmo formato do rascunho). */
    plano: PlanoDeAulaRascunho;

    /** Texto do relatório final gerado pela IA. */
    relatorio: string;

    /** Data em que o plano foi salvo. */
    criadoEm: Date;
}

/**
 * Schema do Mongoose que define a estrutura do documento do plano de aula
 * na coleção "planos-de-aula" do MongoDB.
 *
 * Os campos espelham o tipo PlanoDeAulaFinal do domínio.
 */
const planoDeAulaSchema = new Schema<PlanoDeAulaDocumento>(
    {
        titulo: { type: String, required: true },
        plano: {
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
        relatorio: { type: String, required: true },
    },
    {
        /**
         * timestamps: true adiciona automaticamente os campos createdAt e updatedAt.
         * Usamos createdAt como "criadoEm" para manter o padrão pt-BR.
         */
        timestamps: true,
        collection: 'planos-de-aula',
    },
);

/**
 * Modelo do Mongoose para a coleção "planos-de-aula".
 */
const PlanoDeAulaModelo = mongoose.model<PlanoDeAulaDocumento>(
    'PlanoDeAula',
    planoDeAulaSchema,
);

/**
 * Classe repositório que encapsula as operações de persistência
 * dos planos de aula no MongoDB.
 */
class PlanoDeAulaRepositorio {
    /**
     * Salva o plano de aula final no MongoDB.
     *
     * A persistência é não-fatal: se o MongoDB não estiver conectado ou
     * se a gravação falhar, o erro é registrado em log e o método retorna
     * silenciosamente, sem lançar exceção.
     *
     * @param planoFinal Objeto contendo titulo, plano e relatorio.
     */
    async salvar(planoFinal: {
        titulo: string;
        plano: PlanoDeAulaRascunho;
        relatorio: string;
    }): Promise<void> {
        /**
         * Verifica se o MongoDB está conectado antes de tentar gravar.
         * Se não estiver, apenas registra o aviso e retorna.
         */
        if (!estaConectado()) {
            console.warn(
                '[Repositório] MongoDB não conectado. Plano não foi persistido.',
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
            console.log(
                `[Repositório] Plano de aula "${planoFinal.titulo}" salvo com sucesso.`,
            );
        } catch (erro) {
            /**
             * Persistência não-fatal: se a gravação falhar, registra o erro
             * em log e segue sem derrubar a requisição.
             */
            console.error('[Repositório] Falha ao salvar plano de aula:', erro);
        }
    }
}

export { PlanoDeAulaRepositorio };
