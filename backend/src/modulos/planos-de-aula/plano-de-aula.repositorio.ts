import mongoose, { Schema, Document } from "mongoose";
import { PlanoDeAulaFinal } from "./plano-de-aula.servico";


interface PlanoDeAulaDocumento extends Document {
  titulo: string;
  plano: object;
  relatorio: string;
}


const PlanoDeAulaEsquema = new Schema<PlanoDeAulaDocumento>(
  {
    titulo: { type: String, required: true },
    plano: { type: Schema.Types.Mixed, required: true },
    relatorio: { type: String, required: true },
  },
  {
  
    versionKey: false,
    timestamps: true,
  }
);


const PlanoDeAulaModelo = mongoose.model<PlanoDeAulaDocumento>(
  "PlanoDeAula",
  PlanoDeAulaEsquema
);

/**

 * @param planoFinal Objeto com titulo, plano e relatorio gerados pela IA
 * @returns Promessa que resolve quando o documento for salvo
 */
async function salvarPlanoFinal(planoFinal: PlanoDeAulaFinal): Promise<void> {
  const documento = new PlanoDeAulaModelo({
    titulo: planoFinal.titulo,
    plano: planoFinal.plano,
    relatorio: planoFinal.relatorio,
  });

  await documento.save();
}

export { salvarPlanoFinal };