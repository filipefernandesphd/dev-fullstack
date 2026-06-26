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
/**
 * Tempo máximo (em milissegundos) que esperamos por uma resposta do provedor
 * de IA antes de abortar a requisição.
 *
 * Provedores gratuitos (como o Gemini free tier) podem
 * demorar ou simplesmente travar sob carga. Sem um limite explícito, a
 * requisição do professor ficaria pendurada indefinidamente. Com o timeout,
 * pode-se abortar e devolver uma mensagem clara, mantendo o formato
 * padrão da API.
 */
const TEMPO_LIMITE_IA_MS = 30_000;

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

        /**
         * AbortController permite cancelar a requisição caso o provedor demore
         * mais que o tempo limite. Agendado o aborto com setTimeout e o
         * cancelamento no bloco finally (se a resposta chegar a tempo).
         */
        const controlador = new AbortController();
        const temporizador = setTimeout(
            () => controlador.abort(),
            TEMPO_LIMITE_IA_MS,
        );

        let resposta: Response;

        try {
            resposta = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    /**
                     * Informa que é enviado JSON no corpo da requisição.
                     */
                    'Content-Type': 'application/json',

                    /**
                     * Envia a chave no formato Bearer Token.
                     *
                     * Mesmo quando usa Ollama local com chave fictícia,
                     * manter esse cabeçalho simula uma API real.
                     */
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(corpoRequisicao),
                signal: controlador.signal,
            });
        } catch (erro) {
            /**
             * Aqui ocorrem dois cenários distintos:
             *
             * 1. O AbortController disparou (timeout): o fetch lança um erro
             *    cujo "name" é "AbortError".
             * 2. Falha de rede (DNS, sem conexão, provedor fora do ar): o fetch
             *    lança um TypeError.
             *
             * Em ambos devolvemos uma mensagem amigável, sem vazar detalhes
             * técnicos para o professor.
             */
            if (erro instanceof Error && erro.name === 'AbortError') {
                throw new Error(
                    'Tempo de resposta da IA excedido (timeout). Tente novamente.',
                );
            }

            throw new Error(
                'Não foi possível conectar ao serviço de IA. Verifique a conexão e a URL configurada (AI_API_URL).',
            );
        } finally {
            /**
             * Sempre limpa-se o temporizador para não deixar um setTimeout
             * pendurado após a requisição terminar (evita vazamento de timer).
             */
            clearTimeout(temporizador);
        }

        if (!resposta.ok) {
            const corpoErro = await resposta.text();

            /**
             * Tradução dos códigos de status mais comuns do provedor em
             * mensagens claras. Manter o erro como Error: o controlador o
             * captura e devolve no formato padrão { sucesso, mensagem, dados }.
             */
            if (resposta.status === 429) {
                throw new Error(
                    'Limite de uso da IA atingido (429). Aguarde alguns instantes e tente novamente.',
                );
            }

            if (resposta.status === 401 || resposta.status === 403) {
                throw new Error(
                    'Chave de API inválida ou sem permissão (verifique AI_API_KEY).',
                );
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
