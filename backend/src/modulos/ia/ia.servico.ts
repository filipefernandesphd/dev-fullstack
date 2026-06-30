import 'dotenv/config'; // Carrega as variáveis do .env para o process.env
import { GoogleGenAI } from "@google/genai";
/**
 * Representa uma mensagem enviada para uma API de IA compatível
 * com o padrão Chat Completions.
 */
type MensagemIa = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

/**
 * Representa o corpo da requisição enviada para o provedor de IA.
 */
type RequisicaoIa = {
    model: string;
    temperature: number;
    messages: MensagemIa[];
};

/**
 * Representa parte do formato de resposta esperado de uma API
 * compatível com Chat Completions.
 */
type RespostaIa = {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
};

/**
 * Serviço responsável pela comunicação com o provedor de Inteligência Artificial.
 *
 * Este serviço é genérico. Ele não conhece regras específicas de plano de aula.
 *
 * Responsabilidades:
 *
 * - ler AI_API_KEY, AI_MODEL e AI_API_URL a partir de process.env;
 * - enviar prompts para uma API compatível com Chat Completions;
 * - retornar texto gerado pela IA;
 * - converter respostas textuais em JSON quando necessário.
 *
 * Exemplos de provedores compatíveis:
 *
 * - OpenAI;
 * - OpenRouter;
 * - LiteLLM;
 * - Ollama usando /v1/chat/completions.
 */
class IaServico {
    private readonly apiUrl: string;
    private readonly apiKey: string;
    private readonly modelo: string;


    private readonly ai: GoogleGenAI;

    constructor() {
        this.apiUrl = process.env.AI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
        this.apiKey = process.env.AI_API_KEY || 'AQ.Ab8RN6LSaRsmm3BKWO9Z2Yte95O0UMhN-qFZBWRb2IWVzGs7FA';
        this.modelo = process.env.AI_MODEL || 'gemini-2.5-flash';
        this.ai = new GoogleGenAI({
                apiKey: this.apiKey,
            });

        console.log("API KEY:", this.apiKey);
        console.log("Tamanho:", this.apiKey.length);
       
        if (!this.apiKey) {
            throw new Error('Variável de ambiente AI_API_KEY não configurada.');
        }

        if (!this.modelo) {
            throw new Error('Variável de ambiente AI_MODEL não configurada.');
        }

        if (!this.apiUrl) {
            throw new Error('Variável de ambiente AI_API_URL não configurada.');
        }
    }
    /**
    * Envia um prompt para o provedor de IA e retorna o texto gerado.
    *
    * @param prompt Prompt textual enviado para a IA.
    * @returns Texto retornado pela IA.
    *
    * @throws Error Caso a API de IA retorne erro HTTP.
    * @throws Error Caso a resposta da IA venha vazia ou em formato inesperado.
    */
async gerarTexto(prompt: string): Promise<string> {
    const corpoRequisicao: RequisicaoIa & { response_format?: { type: string } } = {
        model: this.modelo,
        temperature: 0.2,
        messages: [
            {
                role: 'system',
                content: 'Você é um assistente pedagógico especializado em planejamento de uma única aula.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
    };

    const promptFinal = corpoRequisicao.messages
    .map(mensagem => `[${mensagem.role.toUpperCase()}]\n${mensagem.content}`)
    .join("\n\n");

/*
        const resposta = await fetch(urlDestino, {
            method: 'POST',
            headers: headersConfig,
            body: JSON.stringify(corpoRequisicao),
        });*/
        /*
        const resposta = await this.ai.models.generateContent({
            model: corpoRequisicao.model,
            contents: promptFinal,
        });
        console.log("foda")
        if (!resposta.ok) {
            const corpoErro = await resposta.text();

            throw new Error(
                `Erro ao chamar serviço de IA. Status: ${resposta.status}. Detalhes: ${corpoErro}`,
            );
        }*/
       try {
        console.log("teste")
        const resposta = await this.ai.models.generateContent({
            model: corpoRequisicao.model,
            contents: promptFinal,
        });

        if (!resposta.text) {
            throw new Error("Resposta da IA veio vazia.");
        }
        const corpo: RespostaIa = {
            choices: [
                {
                    message: {
                        content: resposta.text ?? "",
                    },
                },
            ],
        };
       const conteudo = corpo.choices?.[0]?.message?.content;

        if (!conteudo) {
            throw new Error("Resposta da IA veio vazia ou em formato inválido.");
        }

        return conteudo;

    } catch (erro) {
        throw new Error(
            `Erro ao chamar serviço de IA: ${
                erro instanceof Error ? erro.message : String(erro)
            }`
        );
    }
/*
        const corpo = (await resposta.json()) as RespostaIa;

        const conteudo = corpo.choices?.[0]?.message?.content;

        if (!conteudo || typeof conteudo !== 'string') {
            throw new Error('Resposta da IA veio vazia ou em formato inválido.');
        }

        return conteudo;*/
    };

    /**
     * Envia um prompt para a IA esperando receber um JSON válido.
     *
     * Este método:
     *
     * 1. chama gerarTexto(prompt);
     * 2. limpa possíveis marcações de Markdown;
     * 3. converte o texto para JSON;
     * 4. retorna o objeto tipado.
     *
     * @param prompt Prompt textual enviado para a IA.
     * @returns Objeto convertido para o tipo esperado.
     *
     * @template T Tipo esperado para o JSON retornado.
     *
     * @throws Error Caso a IA não retorne um JSON válido.
     */
    async gerarJson<T>(prompt: string): Promise<T> {
        const textoGerado = await this.gerarTexto(prompt);

        const textoLimpo = this.limparRespostaJson(textoGerado);

        try {
            return JSON.parse(textoLimpo) as T;
        } catch {
            throw new Error(
                `A IA não retornou um JSON válido. Conteúdo recebido: ${textoGerado}`,
            );
        }
    }

    /**
     * Remove marcações comuns que modelos de IA podem adicionar ao redor do JSON.
     *
     * Alguns modelos, especialmente locais, podem responder assim:
     *
     * ```json
     * { "titulo": "Plano de Aula" }
     * ```
     *
     * Este método remove essas marcações para permitir o uso de JSON.parse.
     *
     * @param texto Texto bruto retornado pela IA.
     * @returns Texto limpo para conversão JSON.
     */
    private limparRespostaJson(texto: string): string {
        return texto
            .trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();
    }
}

export { IaServico };