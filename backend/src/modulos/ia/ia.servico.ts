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
     * @param prompt Prompt textual enviado para a IA.
     * @returns Texto retornado pela IA.
     *
     * @throws Error com mensagens amigáveis baseadas no status HTTP.
     */
    async gerarTexto(prompt: string): Promise<string> {
        const corpoRequisicao: RequisicaoIa = {
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

        // Trata a especificidade do Gemini (Chave via Query Param) vs OpenAI/Ollama (Bearer Token)
        const isGemini = this.apiUrl.includes('generativelanguage.googleapis.com');
        const urlFinal = isGemini ? `${this.apiUrl}?key=${this.apiKey}` : this.apiUrl;
        const headers: Record<string, string> = { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${this.apiKey}`
        }
        
        // if (!isGemini) {
        //      headers['Authorization'] = `Bearer ${this.apiKey}`;
        // }

        try {
            // Utiliza AbortController para tratar timeouts
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const resposta = await fetch(urlFinal, {
                method: 'POST',
                headers,
                body: JSON.stringify(corpoRequisicao),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!resposta.ok) {
                await this.tratarErrosHttp(resposta);
            }

            const corpo = (await resposta.json()) as RespostaIa;
            const conteudo = corpo.choices?.[0]?.message?.content;

            if (!conteudo || typeof conteudo !== 'string') {
                throw new Error('A inteligência artificial retornou uma resposta vazia ou em formato inesperado.');
            }

            return conteudo;
        } catch (erro: any) {
            // Intercepta o erro de timeout nativo do fetch (AbortError)
            if (erro.name === 'AbortError') {
                throw new Error('A conexão com a IA expirou (timeout). Tente novamente mais tarde.');
            }
            throw erro;
        }
    }

    /**
     * Centraliza o tratamento de erros HTTP do provedor de IA.
     */
    private async tratarErrosHttp(resposta: Response): Promise<never> {
        const status = resposta.status;
        
        // Tenta extrair detalhes extras do provedor, se houver
        let detalhesErro = '';
        try {
            const corpoErro = await resposta.text();
            detalhesErro = ` Detalhes técnicos: ${corpoErro}`;
        } catch {
            // Ignora se não conseguir ler o corpo
        }

        switch (status) {
            case 400:
                throw new Error('A requisição para a IA foi malformada ou inválida.' + detalhesErro);
            case 401:
            case 403:
                throw new Error('A chave de acesso (API Key) da inteligência artificial é inválida ou expirou.');
            case 429:
                throw new Error('Você atingiu o limite de requisições da IA gratuita. Por favor, aguarde alguns minutos e tente novamente.');
            case 500:
            case 502:
            case 503:
                throw new Error('O provedor de inteligência artificial está indisponível no momento. Tente novamente mais tarde.');
            default:
                throw new Error(`Erro desconhecido ao comunicar com a IA (Status: ${status}).` + detalhesErro);
        }
    }

    async gerarJson<T>(prompt: string): Promise<T> {
        const textoGerado = await this.gerarTexto(prompt);
        const textoLimpo = this.limparRespostaJson(textoGerado);

        try {
            return JSON.parse(textoLimpo) as T;
        } catch {
            throw new Error(`A IA não retornou um formato JSON válido para a extração de dados.`);
        }
    }

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
