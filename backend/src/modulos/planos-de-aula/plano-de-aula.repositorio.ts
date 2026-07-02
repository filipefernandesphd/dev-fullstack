import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface que define a modelagem de dados do Plano de Aula para armazenamento estruturado no MongoDB.
 */
export interface IPlanoDeAula extends Document {
  titulo: string;
  plano: any; // Utilização de tipo flexível para aceitar o objeto estruturado completo do plano
  relatorio: string;
  criadoEm?: Date;
}

/**
 * Definição do Schema Mongoose aplicando as boas práticas exigidas:
 * - timestamps configurado para registrar automaticamente a auditoria cronológica (`criadoEm`).
 * - versionKey desabilitado (remove o poluente nativo `__v` do MongoDB).
 */
const PlanoDeAulaSchema: Schema = new Schema(
  {
    titulo: { type: String, required: true },
    plano: { type: Schema.Types.Mixed, required: true }, // Mixed permite salvar objetos complexos aninhados sem quebras
    relatorio: { type: String, required: true },
  },
  { 
    timestamps: { createdAt: 'criadoEm', updatedAt: false }, 
    versionKey: false 
  }
);

// Padrão Singleton condicional para evitar re-compilação e sobreposição do modelo em ambientes de testes rápidos (Vitest)
const PlanoDeAulaModelo = mongoose.models.PlanoDeAula || mongoose.model<IPlanoDeAula>('PlanoDeAula', PlanoDeAulaSchema);

/**
 * Camada de Acesso a Dados (Repository Pattern) isolada.
 * Garante que a infraestrutura de banco permaneça desvinculada das regras de aplicação.
 */
export class PlanoDeAulaRepositorio {
  
  /**
   * Conecta de forma preguiçosa (Lazy Load) e segura ao banco se nenhuma conexão estiver estabelecida.
   */
  private async conectar(): Promise<void> {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error('A variável de ambiente obrigatória MONGO_URL não foi definida.');
    }
    
    // Conecta apenas se o estado atual for estritamente Desconectado (0)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUrl);
    }
  }

  /**
   * Executa a gravação do registro finalizado no banco de dados.
   * * @param dados Informações tratadas prontas para inserção persistente.
   */
  async salvar(dados: { titulo: string; plano: any; relatorio: string }): Promise<void> {
    await this.conectar();
    const novoPlano = new PlanoDeAulaModelo(dados);
    await novoPlano.save();
  }
}