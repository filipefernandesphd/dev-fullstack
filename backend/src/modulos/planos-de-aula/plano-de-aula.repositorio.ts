import mongoose, { Schema } from 'mongoose';

import type { PlanoDeAulaFinal } from './plano-de-aula.tipos';

// O rascunho fica embutido dentro do plano final, então definimos ele como um
// sub-schema. O { _id: false } lá embaixo evita que o Mongoose crie um _id pra
// esse pedaço aninhado - a gente só quer guardar os campos do plano, sem lixo extra.
const rascunhoSchema = new Schema(
    {
        titulo: String,
        disciplina: String,
        curso: String,
        nivel: String,
        duracao: String,
        tema: String,
        objetivos: [String],
        conteudos: [String],
        metodologia: String,
        recursos: [String],
        avaliacao: String,
    },
    { _id: false },
);

const planoFinalSchema = new Schema(
    {
        titulo: { type: String, required: true },
        plano: { type: rascunhoSchema, required: true },
        relatorio: { type: String, required: true },
    },
    { timestamps: true, collection: 'planos_de_aula_final' },
);

// Em dev o tsx fica recarregando o arquivo a cada save, e o Mongoose reclama
// ("OverwriteModelError") se registrarmos o mesmo model duas vezes. Por isso
// reaproveitamos o que já está em mongoose.models antes de criar de novo.
const ModeloPlanoFinal =
    mongoose.models.PlanoDeAulaFinal ??
    mongoose.model('PlanoDeAulaFinal', planoFinalSchema);

class PlanoDeAulaRepositorio {
    async salvar(planoFinal: PlanoDeAulaFinal): Promise<void> {
        const url = process.env.MONGO_URL;

        // Se MONGO_URL não estiver setada, simplesmente não persiste e sai.
        // Isso é de propósito: deixa o npm test rodar sem precisar de um Mongo na máquina
        // e mantém a persistência como algo opcional, ligado só quando tem banco.
        if (!url) {
            return;
        }

        try {
            await this.garantirConexao(url);
            await ModeloPlanoFinal.create(planoFinal);
        } catch (erro) {
            // Gravação é não-fatal: se o banco estiver fora, loga e segue.
            // O professor já recebeu o plano gerado pela IA; não faz sentido derrubar
            // a requisição (500) só porque o salvamento falhou.
            const mensagem = erro instanceof Error ? erro.message : String(erro);
            console.error('Falha ao salvar o plano final no MongoDB:', mensagem);
        }
    }

    // Conecta no Mongo só se ainda não estiver conectado. O readyState === 1 quer
    // dizer "conexão aberta", então reaproveitamso ela entre as requisições em
    // vez de abrir uma nova toda hora. O serverSelectionTimeoutMS curto evita que a
    // requisição fique pendurada caso o banco esteja inacessível.
    private async garantirConexao(url: string): Promise<void> {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
    }
}

export { PlanoDeAulaRepositorio };
