import mongoose, { Schema } from 'mongoose';

import { conectarMongo } from '../../config/mongo';
import { config } from '../../config/env';

import type { PlanoDeAulaFinal } from './plano-de-aula.servico';

/**
 * Camada de REPOSITÓRIO do módulo de planos de aula.
 *
 * Responsabilidade única: gravar/ler planos de aula no MongoDB. O repositório
 * não conhece HTTP (req/res) nem regra de negócio — ele apenas persiste.
 *
 * O serviço chama o repositório; o controlador continua fino. Essa separação
 * (rota -> controlador -> serviço -> repositório) é o coração da arquitetura
 * em camadas deste projeto didático.
 */

/**
 * Esquema do Mongoose que espelha a estrutura de PlanoDeAulaFinal.
 *
 * Usamos `_id: false` no subdocumento "plano" porque ele é apenas um espelho
 * do rascunho — não precisa de identificador próprio. O documento de topo,
 * sim, recebe o _id padrão do Mongo e os campos de timestamp.
 */
const esquemaRascunho = new Schema(
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
    { _id: false },
);

const esquemaPlanoFinal = new Schema(
    {
        titulo: { type: String, required: true },
        plano: { type: esquemaRascunho, required: true },
        relatorio: { type: String, required: true },
    },
    {
        /**
         * timestamps adiciona automaticamente os campos createdAt/updatedAt.
         * Úteis para auditar quando cada plano final foi gerado.
         */
        timestamps: true,

        /**
         * Nome explícito da coleção, em snake_case e em português
         */
        collection: 'planos_de_aula_finais',
    },
);

/**
 * Registro do modelo protegido contra reimportação.
 *
 * Em ambientes com hot-reload (ou quando vários arquivos de teste importam a
 * mesma cadeia de módulos), tentar registrar o mesmo modelo duas vezes lança
 * `OverwriteModelError`. Por isso reaproveitamos o modelo já registrado em
 * `mongoose.models` quando ele existir.
 */
const ModeloPlanoFinal =
    mongoose.models.PlanoDeAulaFinal ??
    mongoose.model('PlanoDeAulaFinal', esquemaPlanoFinal);

class PlanoDeAulaRepositorio {
    /**
     * Salva o plano de aula final no MongoDB.
     *
     * Características desta gravação (exigidas pela atividade):
     *
     * - GUARDADA por MONGO_URL: sem a variável, nada é gravado.
     * - NÃO-FATAL: qualquer falha (banco fora do ar, validação, etc.) é apenas
     *   registrada em log; nunca lançamos erro. Assim a requisição do professor
     *   não é derrubada por um problema de persistência, e `npm test` passa
     *   mesmo sem MongoDB na máquina.
     * - Retorna `void`: quem chama (o serviço) continua devolvendo o objeto
     *   vindo da IA, NUNCA o documento do Mongoose (que traria _id/__v e
     *   quebraria o contrato da resposta de /final).
     *
     * @param planoFinal Plano final já gerado e validado pela IA.
     */
    async salvarPlanoFinal(planoFinal: PlanoDeAulaFinal): Promise<void> {
        /**
         * Sem MONGO_URL não persistimos. Registramos em log para deixar claro,
         * durante o desenvolvimento, que a gravação foi intencionalmente pulada.
         */
        if (!config.mongoUrl) {
            console.warn(
                'MONGO_URL não configurada. Persistência do plano final foi ignorada.',
            );
            return;
        }

        try {
            await conectarMongo();
            await ModeloPlanoFinal.create(planoFinal);
        } catch (erro) {
            /**
             * Persistência não-fatal: registramos o erro e seguimos. A resposta
             * de sucesso para o professor é preservada.
             */
            console.error('Falha ao persistir o plano de aula final no MongoDB:', erro);
        }
    }
}

export { PlanoDeAulaRepositorio };
