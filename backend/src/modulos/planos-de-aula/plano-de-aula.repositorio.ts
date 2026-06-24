/**
 * Repositório para salvar planos de aula no MongoDB
 * 
 * Este arquivo é responsável por:
 * 1. Definir como os planos são salvos no banco
 * 2. Conectar ao MongoDB quando necessário
 * 3. Tratar erros sem quebrar a aplicação
 * 4. Filtrar planos por sessão (identificador do navegador)
 */

import mongoose from 'mongoose';

// --- 1. Definição do Schema (estrutura dos dados) ---
// Um schema é como um molde que diz como os dados devem ser organizados no banco
const planoDeAulaSchema = new mongoose.Schema({
  // Título do plano (obrigatório)
  titulo: { 
    type: String, 
    required: true 
  },
  // Conteúdo do plano (obrigatório)
  plano: { 
    type: String, 
    required: true 
  },
  // Relatório final (obrigatório)
  relatorio: { 
    type: String, 
    required: true 
  },
  // Identificador da sessão do navegador (para isolar planos por usuário)
  sessaoId: { 
    type: String, 
    required: true,
    index: true // Cria um índice para busca mais rápida
  },
  // Data de criação (preenchido automaticamente)
  criadoEm: { 
    type: Date, 
    default: Date.now 
  }
});

// --- 2. Criação do Model ---
// O model é a "classe" que usamos para interagir com o banco
const PlanoDeAula = mongoose.model('PlanoDeAula', planoDeAulaSchema);

// --- 3. Classe Repositório ---
// Esta classe contém os métodos para salvar e buscar dados
export class PlanoDeAulaRepositorio {
  
  /**
   * Salva um plano de aula no MongoDB
   * 
   * @param plano - O plano de aula a ser salvo (titulo, plano, relatorio)
   * @param sessaoId - Identificador único da sessão do navegador
   * @returns O mesmo plano que foi enviado (sem os campos do MongoDB)
   */
  async salvar(plano: { titulo: string; plano: string; relatorio: string }, sessaoId: string) {
    try {
      // Verifica se a URL do MongoDB está configurada
      if (!process.env.MONGO_URL) {
        console.log('MONGO_URL não configurada - plano NÃO foi salvo no banco');
        return plano;
      }

      // Verifica se já está conectado ao MongoDB
      if (mongoose.connection.readyState === 0) {
        console.log('Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Conectado ao MongoDB com sucesso!');
      }

      // Cria uma nova instância do plano (usando o model)
      const novoPlano = new PlanoDeAula({
        titulo: plano.titulo,
        plano: plano.plano,
        relatorio: plano.relatorio,
        sessaoId: sessaoId
      });

      // Salva no banco de dados
      await novoPlano.save();
      console.log(`Plano salvo no MongoDB! ID: ${novoPlano._id}`);

      // Retorna o plano original (sem os campos do MongoDB)
      return plano;

    } catch (erro) {
      console.error('Erro ao salvar no MongoDB:', erro);
      return plano;
    }
  }

  /**
   * Lista todos os planos de aula de uma sessão específica
   * 
   * @param sessaoId - Identificador único da sessão do navegador
   * @returns Lista de planos (apenas título, data e ID)
   */
  async listarTodos(sessaoId: string): Promise<any[]> {
    try {
      if (!process.env.MONGO_URL) {
        return [];
      }

      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URL);
      }

      // Busca apenas os planos da sessão, ordena do mais recente
      const planos = await PlanoDeAula
        .find({ sessaoId: sessaoId })
        .sort({ criadoEm: -1 })
        .select('titulo criadoEm')
        .lean();

      return planos;
    } catch (erro) {
      console.error('Erro ao listar planos:', erro);
      return [];
    }
  }

  /**
   * Busca um plano específico pelo ID
   * 
   * @param id - ID do plano no MongoDB
   * @param sessaoId - Identificador da sessão (para garantir que o plano pertence ao usuário)
   * @returns O plano completo ou null se não encontrado
   */
  async buscarPorId(id: string, sessaoId: string): Promise<any> {
    try {
      if (!process.env.MONGO_URL) {
        return null;
      }

      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URL);
      }

      // Busca o plano, garantindo que pertence à sessão
      const plano = await PlanoDeAula.findOne({ 
        _id: id, 
        sessaoId: sessaoId 
      }).lean();

      return plano;
    } catch (erro) {
      console.error('Erro ao buscar plano:', erro);
      return null;
    }
  }
}