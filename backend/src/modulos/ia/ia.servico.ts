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
    * @throws Error Caso a API de IA retorne erro HTTP.
    * @throws Error Caso a resposta da IA venha vazia ou em formato inesperado.
    */
    /**
     * Envia uma requisição para o provedor de IA com controle de timeout.
     *
     * Separa o fetch do tratamento de erros para manter o método principal
     * mais limpo e permitir reúso em diferentes cenários.
     *
     * @param corpoRequisicao Corpo da requisição no formato Chat Completions.
     * @returns Resposta HTTP do provedor de IA.
     *
     * @throws Error Caso ocorra timeout ou erro de rede.
     */
    private async enviarRequisicao(
        corpoRequisicao: RequisicaoIa,
    ): Promise<Response> {
        /**
         * Controlador de timeout: aborta a requisição após 30 segundos.
         */
        const controleAbort = new AbortController();
        const timeoutId = setTimeout(() => controleAbort.abort(), 30000);

        try {
            const resposta = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    /**
                     * Informa que estamos enviando JSON no corpo da requisição.
                     */
                    'Content-Type': 'application/json',

                    /**
                     * Envia a chave no formato Bearer Token.
                     *
                     * Mesmo quando usamos Ollama local com chave fictícia,
                     * manter esse cabeçalho simula uma API real.
                     */
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(corpoRequisicao),
                signal: controleAbort.signal,
            });

            return resposta;
        } catch (erro) {
            if (erro instanceof DOMException && erro.name === 'AbortError') {
                throw new Error(
                    'O serviço de IA não respondeu dentro do tempo limite (30 segundos). ' +
                    'Verifique sua conexão com a internet e tente novamente.',
                );
            }

            throw new Error(
                'Erro de conexão com o serviço de IA. ' +
                'Verifique sua conexão com a internet e tente novamente.',
            );
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Converte erros HTTP do provedor de IA em mensagens amigáveis.
     *
     * Cada código de status recebe uma mensagem específica para que o professor
     * entenda o que aconteceu sem precisar ver detalhes técnicos.
     *
     * @param status Código HTTP retornado pelo provedor.
     * @param corpoErro Corpo da resposta de erro (texto).
     *
     * @throws Error Com mensagem adaptada ao tipo de erro.
     */
    private tratarErroHttp(status: number, corpoErro: string): never {
        /**
         * Tenta extrair detalhes do corpo do erro (ex.: quota exceeded do Gemini).
         * Se conseguir, enriquece a mensagem padrão com essas informações.
         */
        let detalheExtra = '';
        try {
            const erroJson = JSON.parse(corpoErro);
            if (erroJson?.error?.message) {
                detalheExtra = erroJson.error.message;
            }
        } catch {
            // Corpo não é JSON — usa a mensagem padrão mesmo.
        }

        const mensagensPorStatus: Record<number, string> = {
            400: 'A requisição enviada para o serviço de IA é inválida. Verifique as configurações (AI_API_URL, AI_MODEL).',
            401: 'Chave de API do serviço de IA inválida ou não autorizada. Verifique a variável AI_API_KEY.',
            403: 'Acesso negado pelo serviço de IA. Verifique se a chave (AI_API_KEY) tem permissão para usar o modelo configurado.',
            429: 'Cota do serviço de IA excedida. ' +
                (detalheExtra || 'Aguarde alguns instantes e tente novamente. ' +
                'Se o problema persistir, crie uma nova chave em https://aistudio.google.com/apikey'),
        };

        const mensagem =
            mensagensPorStatus[status] ||
            `Erro ao chamar serviço de IA. Status: ${status}. Detalhes: ${corpoErro}`;

        throw new Error(mensagem);
    }

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

        const resposta = await this.enviarRequisicao(corpoRequisicao);

        if (!resposta.ok) {
            const corpoErro = await resposta.text();
            this.tratarErroHttp(resposta.status, corpoErro);
        }

        const corpo = (await resposta.json()) as RespostaIa;

        const conteudo = corpo.choices?.[0]?.message?.content;

        if (!conteudo || typeof conteudo !== 'string') {
            throw new Error('Resposta da IA veio vazia ou em formato inválido.');
        }

        return conteudo;
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