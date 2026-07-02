import axios from 'axios';

/**
 * Interface que representa a estrutura de mensagens esperada pela API de Chat Completions.
 * Segue o padrão universal adotado por grandes provedores de modelos de linguagem (LLMs).
 */
export interface MensagemIA {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Serviço genérico responsável pela integração com o provedor de Inteligência Artificial.
 * Implementa compatibilidade com o formato OpenAI Chat Completions utilizado pelo Google Gemini.
 * Atende às diretrizes de tratamento robusto de falhas e manutenção do contrato de resposta da aplicação.
 * * @author Seu Nome
 */
export class IaServico {
  // As credenciais e endpoints são isolados via variáveis de ambiente para conformidade de segurança
  private apiUrl = process.env.AI_API_URL;
  private model = process.env.AI_MODEL || 'gemini-2.0-flash';
  private apiKey = process.env.AI_API_KEY;

  /**
   * Envia um histórico de mensagens estruturado para o provedor de IA configurado por variáveis de ambiente.
   * Método de baixo nível focado na comunicação HTTP bruta e tratamento de status de erro do provedor.
   * * @param mensagens Lista de mensagens contendo o contexto e as interações do usuário.
   * @returns Objeto de resposta contendo a estrutura de completions ou tratamento amigável de erro.
   */
  async enviarMensagem(mensagens: MensagemIA[]): Promise<any> {
    // Validação preventiva: evita chamadas infrutíferas se a infraestrutura não estiver configurada
    if (!this.apiKey || !this.apiUrl) {
      return {
        sucesso: false,
        mensagem: "Configuração de IA incompleta: Verifique as variáveis de ambiente AI_API_KEY e AI_API_URL.",
        dados: {}
      };
    }

    try {
      const resposta = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: mensagens,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          // Timeout estendido para 25 segundos para evitar travamentos em respostas longas e complexas de planos de aula
          timeout: 25000 
        }
      );

      return resposta.data;

    } catch (erro: any) {
      console.error("Falha detectada na comunicação com o provedor de IA externa:", erro.message);

      let mensagemAmigavel = "Não foi possível estabelecer contato com o motor de IA neste momento. Tente novamente.";

      // Tratamento granular de erros exigido pelo regulamento da atividade avaliativa
      if (erro.response) {
        const status = erro.response.status;
        
        // Erro 429: Excesso de requisições comum no Free Tier do Gemini
        if (status === 429) {
          mensagemAmigavel = "O limite de requisições gratuitas do Gemini foi atingido. Aguarde cerca de 1 minuto e tente novamente.";
        } 
        // Erros 401/403: Problemas de autenticação ou chaves expiradas/inválidas
        else if (status === 401 || status === 403) {
          mensagemAmigavel = "Chave de autenticação da API de IA inválida ou expirada. Notifique o administrador.";
        } 
        // Erro 404: Endpoint ou modelo incorreto configurado
        else if (status === 404) {
          mensagemAmigavel = "O modelo de IA solicitado ou o endpoint especificado não foram encontrados no provedor.";
        }
      } 
      // Erro de Timeout (Excesso de tempo de resposta do servidor remoto)
      else if (erro.code === 'ECONNABORTED') {
        mensagemAmigavel = "O tempo limite de espera para geração do plano pedagógico foi esgotado pelo provedor.";
      }

      // Mantém estritamente o formato padrão estipulado em contrato OpenAPI sem estourar erro 500 fatal na API
      return {
        sucesso: false,
        mensagem: messageAmigavel,
        dados: {}
      };
    }
  }

  /**
   * Envia um prompt textual e processa o retorno da IA convertendo-o diretamente para um objeto estruturado (JSON).
   * Realiza a higienização de blocos de código Markdown gerados comumente pelas IAs.
   * * @param prompt Instrução ou comando detalhado enviado para a IA.
   * @returns Objeto tipado de acordo com o contrato esperado pelo serviço chamador.
   */
  async gerarJson<T>(prompt: string): Promise<T> {
    const mensagens: MensagemIA[] = [
      { role: 'user', content: prompt }
    ];

    const respostaBruta = await this.enviarMensagem(mensagens);

    // Se o envio falhar e cair no catch de enviarMensagem, repassa a mensagem amigável tratada
    if (respostaBruta && respostaBruta.sucesso === false) {
      throw new Error(respostaBruta.mensagem);
    }

    try {
      let textoJson = '';

      // Extração do conteúdo textual vindo do padrão OpenAI Chat Completions
      if (respostaBruta && respostaBruta.choices && respostaBruta.choices[0]?.message?.content) {
        textoJson = respostaBruta.choices[0].message.content;
      } else if (typeof respostaBruta === 'string') {
        textoJson = respostaBruta;
      } else {
        throw new Error("A resposta retornada pela inteligência artificial veio vazia ou em formato inválido.");
      }

      // Tratamento e limpeza preventiva contra marcações markdown do tipo ```json ... ```
      if (textoJson.includes('```json')) {
        textoJson = textoJson.split('```json')[1].split('```')[0];
      } else if (textoJson.includes('```')) {
        textoJson = textoJson.split('```')[1].split('```')[0];
      }

      return JSON.parse(textoJson.trim()) as T;

    } catch (erro: any) {
      console.error("Erro crítico ao tentar realizar o parse do JSON enviado pela IA:", erro.message);
      throw new Error(`A IA falhou em gerar dados estruturados válidos. Detalhes: ${erro.message}`);
    }
  }
}