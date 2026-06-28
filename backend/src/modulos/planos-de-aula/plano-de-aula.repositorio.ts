import mongoose from 'mongoose';
import { PlanoDeAulaFinal } from './plano-de-aula.servico';

/**
 * Esquema do Mongoose para persistência do plano de aula final.
 * Usamos 'Object' para o rascunho (plano) para manter a flexibilidade da estrutura.
 */
const PlanoDeAulaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    plano: { type: Object, required: true },
    relatorio: { type: String, required: true },
    criadoEm: { type: Date, default: Date.now }
});

// Evita o erro de "OverwritingModelError" durante hot-reloads no ambiente de desenvolvimento
const PlanoDeAulaModel = mongoose.models.PlanoDeAula || mongoose.model('PlanoDeAula', PlanoDeAulaSchema);

/**
 * Repositório responsável pelo acesso a dados de Planos de Aula.
 * Isola completamente o Mongoose e o MongoDB da nossa regra de negócio.
 */
class PlanoDeAulaRepositorio {
    
    /**
     * Salva o plano de aula no MongoDB de forma segura (não-fatal).
     * Se a variável de ambiente MONGO_URL não existir ou a conexão falhar,
     * a aplicação apenas registrará um aviso no console e continuará a execução normal.
     *
     * @param planoFinal Objeto estruturado do plano de aula final gerado pela IA.
     */
    async salvar(planoFinal: PlanoDeAulaFinal): Promise<void> {
        const mongoUrl = process.env.MONGO_URL;

        if (!mongoUrl) {
            console.warn('Aviso: MONGO_URL não configurada. O plano gerado não será persistido no banco de dados.');
            return;
        }

        try {
            // Garante que a conexão está ativa antes de tentar salvar
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(mongoUrl);
                console.log('Conexão estabelecida com o MongoDB.');
            }

            const documento = new PlanoDeAulaModel({
                titulo: planoFinal.titulo,
                plano: planoFinal.plano,
                relatorio: planoFinal.relatorio
            });

            await documento.save();
            console.log(`Plano de aula "${planoFinal.titulo}" salvo com sucesso no banco de dados.`);
            
        } catch (erro) {
            // A persistência é não-fatal. Registramos o erro, mas NÃO usamos throw,
            // garantindo que o usuário receba o plano na tela mesmo se o banco cair.
            console.error('Erro não-fatal ao tentar salvar o plano no MongoDB:', erro);
        }
    }
}

export { PlanoDeAulaRepositorio };
