import mongoose, { Schema } from 'mongoose';

import { PlanoDeAulaFinal } from './plano-de-aula.servico';

/**
 * Define a estrutura mínima persistida no MongoDB para um plano de aula final.
 *
 * O schema usa Schema.Types.Mixed para o campo "plano" porque o plano de aula
 * é gerado por IA e pode evoluir didaticamente ao longo do projeto. Mesmo assim,
 * a validação principal continua acontecendo no serviço antes da persistência.
 */
const PlanoDeAulaSchema = new Schema(
    {
        titulo: {
            type: String,
            required: true,
        },
        plano: {
            type: Schema.Types.Mixed,
            required: true,
        },
        relatorio: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

/**
 * Modelo Mongoose usado para gravar planos finais no MongoDB.
 *
 * O terceiro argumento fixa o nome da coleção como "planos_de_aula",
 * evitando surpresas com pluralização automática do Mongoose.
 */
const PlanoDeAulaModelo =
    mongoose.models.PlanoDeAula ||
    mongoose.model('PlanoDeAula', PlanoDeAulaSchema, 'planos_de_aula');

/**
 * Repositório responsável por isolar toda a comunicação com o MongoDB.
 *
 * Essa camada existe para manter o serviço de aplicação focado na regra de
 * negócio, conforme a atividade exige: rota → controlador → serviço → repositório.
 */
class PlanoDeAulaRepositorio {
    /**
     * Garante uma conexão ativa com o MongoDB quando MONGO_URL existir.
     *
     * A conexão é opcional para que os testes automatizados continuem passando
     * em ambientes sem MongoDB local. Em produção, o Render receberá a MONGO_URL
     * apontando para o MongoDB Atlas.
     */
    private async conectarSeNecessario(): Promise<boolean> {
        const mongoUrl = process.env.MONGO_URL;

        if (!mongoUrl) {
            console.warn(
                'MONGO_URL não configurada. A persistência do plano final será ignorada.',
            );

            return false;
        }

        if (mongoose.connection.readyState === 1) {
            return true;
        }

        await mongoose.connect(mongoUrl);

        return true;
    }

    /**
     * Salva o plano de aula final no MongoDB.
     *
     * @param planoFinal Plano final validado pelo serviço de aplicação.
     */
    async salvarPlanoFinal(planoFinal: PlanoDeAulaFinal): Promise<void> {
        const conectado = await this.conectarSeNecessario();

        if (!conectado) {
            return;
        }

        await PlanoDeAulaModelo.create({
            titulo: planoFinal.titulo,
            plano: planoFinal.plano,
            relatorio: planoFinal.relatorio,
        });
    }
}

export { PlanoDeAulaRepositorio };