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
 * - Ollama usando /v1/chat/completions;
 * - Google Gemini via endpoint compatível com OpenAI.
 */
class IaServico {
    private readonly apiUrl: string;
    private readonly apiKey: string;
    private readonly modelo: string;

    constructor() {
        this.apiUrl = process.env.AI_API_URL || '';
        this.apiKey = process.env.AI_API_KEY || '';
        this.modelo = process.env.AI_MODEL || '';

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
     * Responsabilidades deste método:
     *
     * - Montar o corpo da requisição no padrão Chat Completions.
     * - Enviar a requisição com um tempo limite (timeout) usando AbortController.
     * - Tratar os erros mais comuns vindos do provedor e converter cada um em
     *   uma mensagem didática em português (pt-BR), mantendo o contrato de erro
     *   baseado em lançamento de Error (que o controlador converte em
     *   `{ sucesso, mensagem, dados }`).
     *
     * Tratamento de erros do provedor:
     *
     * - Timeout (sem resposta em tempo hábil): mensagem amigável sugerindo
     *   nova tentativa em alguns instantes.
     * - Falha de rede/conexão: mensagem indicando problema de conexão.
     * - HTTP 401/403: chave de acesso inválida ou sem permissão.
     * - HTTP 429: limite de uso (rate limit) do provedor atingido.
     * - Outros status HTTP: mensagem genérica com o status e o corpo do erro.
     * - Resposta vazia ou em formato inválido: mensagem indicando formato inválido.
     *
     * @param prompt Prompt textual enviado para a IA.
     * @returns Texto retornado pela IA.
     *
     * @throws Error Caso a API de IA retorne erro HTTP, timeout ou resposta inválida.
     */
    async gerarTexto(prompt: string): Promise<string> {
        const corpoRequisicao: RequisicaoIa = {
            model: this.modelo,
            temperature: 0.2,
            messages: [
                {
                    role: 'system',
                    content:
                        'Você é um assistente pedagógico especializado em planejamento de uma única aula.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        };

        const tempoLimiteMs = 30000;
        const controlador = new AbortController();
        const timeout = setTimeout(() => controlador.abort(), tempoLimiteMs);

        let resposta: Response;

        try {
            resposta = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(corpoRequisicao),
                signal: controlador.signal,
            });
        } catch (erro: unknown) {
            if (erro instanceof Error && erro.name === 'AbortError') {
                throw new Error(
                    'O tempo limite para resposta do serviço de IA foi excedido (30 s). Tente novamente em alguns instantes.',
                );
            }

            throw new Error(
                'Não foi possível conectar ao serviço de IA. Verifique sua conexão de rede e tente novamente.',
            );
        } finally {
            clearTimeout(timeout);
        }

        if (!resposta.ok) {
            if (resposta.status === 401 || resposta.status === 403) {
                throw new Error(
                    'Falha de autenticação com o serviço de IA: a chave de acesso é inválida ou não possui permissão. Verifique a configuração da variável AI_API_KEY.',
                );
            }

            if (resposta.status === 429) {
                throw new Error(
                    'Limite de uso do serviço de IA foi atingido (HTTP 429). Aguarde alguns instantes e tente novamente. Se o problema persistir, considere um plano com maior cota.',
                );
            }

            let corpoErro = '';
            try {
                corpoErro = await resposta.text();
            } catch {
                corpoErro = '';
            }

            throw new Error(
                `Erro ao chamar serviço de IA. Status: ${resposta.status}. Detalhes: ${corpoErro}`,
            );
        }

        const corpo = (await resposta.json()) as RespostaIa;

        const conteudo = corpo.choices?.[0]?.message?.content;

        if (!conteudo || typeof conteudo !== 'string') {
            throw new Error('Resposta da IA veio vazia ou em formato inválido.');
        }

        return conteudo;
    }

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
