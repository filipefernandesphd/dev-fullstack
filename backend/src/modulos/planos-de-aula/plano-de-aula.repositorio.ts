import { PlanoDeAulaModelo } from './plano-de-aula.modelo';
import { PlanoDeAulaFinal } from './plano-de-aula.tipos'; // Use o tipo correspondente que você já tem em tipos.ts

/**
 * Repositório responsável pelas operações de persistência de planos de aula no MongoDB.
 * Isola o acesso a dados. Suas operações são não-fatais: caso o banco esteja inacessível,
 * o erro é registrado em log e a execução do fluxo principal continua normalmente.
 */
export class PlanoDeAulaRepositorio {
    
    /**
     * Salva de forma segura o relatório final de um plano de aula no MongoDB.
     * * @param dados Objeto contendo o título, o rascunho do plano e o relatório final.
     */
    async salvar(dados: PlanoDeAulaFinal): Promise<void> {
        // Se a variável MONGO_URL não existir, ignora silenciosamente sem quebrar os testes 
        if (!process.env.MONGO_URL) {
            console.warn('Aviso: MONGO_URL não configurada. Salvamento no banco pulado.');
            return;
        }

        try {
            await PlanoDeAulaModelo.create({
                titulo: dados.titulo,
                plano: dados.plano,
                relatorio: dados.relatorio
            });
            console.log(`Sucesso: Plano "${dados.titulo}" persistido com êxito no MongoDB.`);
        } catch (erro: any) {
            // Requisito: Captura o erro no log, mas não usa throw para não derrubar a requisição 
            console.error(`Erro de persistência não-fatal no MongoDB: ${erro.message}`);
        }
    }
}