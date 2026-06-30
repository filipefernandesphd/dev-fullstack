import { Schema, model, Document } from 'mongoose';
import type { PlanoDeAulaFinal } from './plano-de-aula.tipos';

// Criamos uma interface que estende o seu tipo e os recursos do Mongoose Document
interface IPlanoFinalDoc extends PlanoDeAulaFinal, Document {
  criadoEm: Date;
}

const PlanoFinalSchema = new Schema<IPlanoFinalDoc>(
  {
    // Armazena o título como String
    titulo: { 
      type: String, 
      required: true 
    },
    // Se o seu 'plano' for um objeto estruturado, usamos Schema.Types.Mixed
    // Se for apenas texto simples, mude para String
    plano: { 
      type: Schema.Types.Mixed, 
      required: true 
    },
    // Armazena o relatório pedagógico da IA
    relatorio: { 
      type: String, 
      required: true 
    }
  },
  { 
    // Cria automaticamente as propriedades 'createdAt' e 'updatedAt' no banco
    timestamps: true 
  }
);

export const PlanoFinalModelo = model<IPlanoFinalDoc>('PlanoFinal', PlanoFinalSchema);