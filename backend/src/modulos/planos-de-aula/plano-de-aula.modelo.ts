import { Schema, model, Document } from 'mongoose';

/**
 * Interface que define a estrutura de um Plano de Aula Final para o TypeScript.
 * Define as propriedades exatas que serão persistidas no banco de dados.
 */
export interface IPlanoDeAulaDoc extends Document {
    titulo: string;
    plano: string;
    relatorio: string;
    criadoEm: Date;
}

/**
 * Esquema do Mongoose que dita as regras de armazenamento no MongoDB.
 * Documenta os campos obrigatórios e os tipos de dados para auditoria didática.
 */
const EsquemaPlanoDeAula = new Schema<IPlanoDeAulaDoc>({
    titulo: { 
        type: String, 
        required: [true, 'O título do plano de aula é obrigatório.'] 
    },
    plano: { 
        type: String, 
        required: [true, 'O conteúdo do rascunho do plano é obrigatório.'] 
    },
    relatorio: { 
        type: String, 
        required: [true, 'O relatório final gerado pela IA é obrigatório.'] 
    },
    criadoEm: { 
        type: Date, 
        default: Date.now 
    }
});

export const PlanoDeAulaModelo = model<IPlanoDeAulaDoc>('PlanoDeAula', EsquemaPlanoDeAula, 'planos_de_aula');