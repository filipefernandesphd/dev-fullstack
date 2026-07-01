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
 */

class IaServico {
    private readonly apiUrl: string;
    private readonly apiKey: string;
    private readonly modelo: string;

    constructor() {
        this.apiUrl = process.env.AI_API_URL || '';
        this.apiKey = process.env.AI_API_KEY || '';
        this.modelo = process.env.AI_MODEL || '';

        if (!this.apiKey) throw new Error('AI_API_KEY não configurada.');
        if (!this.modelo) throw new Error('AI_MODEL não configurado.');
        if (!this.apiUrl) throw new Error('AI_API_URL não configurado.');
    }

    async gerarTexto(prompt: string): Promise<string> {
        const body = {
            model: this.modelo,
            temperature: 0.2,
            messages: [
                {
                    role: 'system',
                    content:
                        'Você é um assistente pedagógico especializado em planos de aula.',
                },
                { role: 'user', content: prompt },
            ],
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
            const resposta = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                    /**
                     * CORREÇÃO PRINCIPAL GEMINI
                     */
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            const raw = await resposta.text();

            if (!resposta.ok) {
                throw new Error(
                    `[IA ERROR] status=${resposta.status} body=${raw}`,
                );
            }

            const json = JSON.parse(raw);

            const content =
                json?.choices?.[0]?.message?.content ??
                json?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!content) {
                throw new Error(
                    'IA retornou resposta vazia ou formato inesperado.',
                );
            }

            return content;
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                throw new Error('Timeout na requisição da IA (30s).');
            }

            throw new Error(
                'Falha ao comunicar com IA: ' +
                    (err instanceof Error ? err.message : String(err)),
            );
        } finally {
            clearTimeout(timeout);
        }
    }

    async gerarJson<T>(prompt: string): Promise<T> {
        const texto = await this.gerarTexto(prompt);

        const limpo = texto
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        try {
            return JSON.parse(limpo) as T;
        } catch {
            throw new Error(
                `IA não retornou JSON válido. Conteúdo: ${texto}`,
            );
        }
    }
}

export { IaServico };