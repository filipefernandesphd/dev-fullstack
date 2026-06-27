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
     * O Gemini oferece endpoint compatível com Chat Completions. Por isso,
     * este serviço continua genérico e depende apenas das variáveis:
     * AI_API_URL, AI_MODEL e AI_API_KEY.
     */
    async gerarTexto(prompt: string): Promise<string> {
        const corpoRequisicao: RequisicaoIa = {
            model: this.modelo,
            temperature: 0.2,
            messages: [
                {
                    role: 'system',
                    content:
                        'Você é um assistente pedagógico especializado em planejamento de uma única aula. Responda sempre em português do Brasil.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        };

        const controladorAbort = new AbortController();

        const temporizadorTimeout = setTimeout(() => {
            controladorAbort.abort();
        }, 30000);

        try {
            const resposta = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(corpoRequisicao),
                signal: controladorAbort.signal,
            });

            if (!resposta.ok) {
                await this.tratarErroHttp(resposta);
            }

            const corpo = (await resposta.json()) as RespostaIa;

            const conteudo = corpo.choices?.[0]?.message?.content;

            if (!conteudo || typeof conteudo !== 'string') {
                throw new Error('Resposta da IA veio vazia ou em formato inválido.');
            }

            return conteudo;
        } catch (erro) {
            if (erro instanceof Error && erro.name === 'AbortError') {
                throw new Error(
                    'O serviço de IA demorou demais para responder. Tente novamente em instantes.',
                );
            }

            throw erro;
        } finally {
            clearTimeout(temporizadorTimeout);
        }
    }

    /**
     * Trata erros HTTP retornados pelo provedor de IA com mensagens didáticas.
     *
     * A API externa pode falhar por limite de uso, chave inválida, indisponibilidade
     * temporária ou erro de validação. Aqui traduzimos esses casos para mensagens
     * claras sem vazar segredos ou detalhes sensíveis da requisição.
     */
    private async tratarErroHttp(resposta: Response): Promise<never> {
        const corpoErro = await resposta.text();

        if (resposta.status === 401 || resposta.status === 403) {
            throw new Error(
                'Não foi possível autenticar no serviço de IA. Verifique se a chave AI_API_KEY está correta.',
            );
        }

        if (resposta.status === 429) {
            throw new Error(
                'O limite de uso do serviço de IA foi atingido. Aguarde alguns minutos e tente novamente.',
            );
        }

        if (resposta.status >= 500) {
            throw new Error(
                'O serviço de IA está temporariamente indisponível. Tente novamente mais tarde.',
            );
        }

        throw new Error(
            `Erro ao chamar serviço de IA. Status: ${resposta.status}. Detalhes: ${corpoErro}`,
        );
    }

    /**
     * Envia um prompt para a IA esperando receber um JSON válido.
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