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
// Quanto tempo a gente espera a IA responder antes de desistir (em ms).
// Fica como constante pra quem ler saber de onde vem o número, e o ambiente
// pode sobrescrever via AI_TIMEOUT_MS quando precisar.
const TEMPO_LIMITE_PADRAO_MS = 30000;

class IaServico {
    private readonly apiUrl: string;
    private readonly apiKey: string;
    private readonly modelo: string;
    private readonly tempoLimiteMs: number;

    constructor() {
        this.apiUrl = process.env.AI_API_URL || '';
        this.apiKey = process.env.AI_API_KEY || '';
        this.modelo = process.env.AI_MODEL || '';

        const tempoLimiteConfigurado = Number(process.env.AI_TIMEOUT_MS);
        this.tempoLimiteMs =
            Number.isFinite(tempoLimiteConfigurado) && tempoLimiteConfigurado > 0
                ? tempoLimiteConfigurado
                : TEMPO_LIMITE_PADRAO_MS;

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

        const controladorAborto = new AbortController();
        const temporizador = setTimeout(
            () => controladorAborto.abort(),
            this.tempoLimiteMs,
        );

        let resposta: globalThis.Response;

        try {
            resposta = await fetch(this.apiUrl, {
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
                signal: controladorAborto.signal,
            });
        } catch (erro) {
            throw this.traduzirFalhaDeRede(erro);
        } finally {
            clearTimeout(temporizador);
        }

        if (!resposta.ok) {
            const corpoErro = await resposta.text();

            throw new Error(this.traduzirErroHttp(resposta.status, corpoErro));
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

    // O provedor responde com códigos HTTP que sozinhos não dizem nada pro professor.
    // Aqui a gente traduz os casos que mais aparecem (chave inválida, limite de uso,
    // provedor fora do ar) numa mensagem que explica o que fazer. O resto cai no
    // genérico do final, ainda com o status pra ajudar a depurar.
    private traduzirErroHttp(status: number, corpoErro: string): string {
        if (status === 401 || status === 403) {
            return 'Falha de autenticação com o provedor de IA: verifique se a chave de API (AI_API_KEY) é válida e tem permissão.';
        }

        if (status === 429) {
            return 'O provedor de IA recusou a requisição por limite de uso (429). Aguarde alguns instantes e tente novamente.';
        }

        if (status >= 500) {
            return `O provedor de IA está indisponível no momento (status ${status}). Tente novamente mais tarde.`;
        }

        return `Erro ao chamar serviço de IA. Status: ${status}. Detalhes: ${corpoErro}`;
    }

    // Tem falha que nem chega a virar resposta HTTP: ou estourou o tempo limite
    // (o AbortController dispara um erro com name 'AbortError'), ou a conexão
    // caiu mesmo. Como os dois são problemas de rede, separamos do traduzirErroHttp.
    private traduzirFalhaDeRede(erro: unknown): Error {
        if (erro instanceof Error && erro.name === 'AbortError') {
            return new Error(
                `O provedor de IA demorou para responder (limite de ${this.tempoLimiteMs} ms). Tente novamente.`,
            );
        }

        return new Error(
            'Não foi possível conectar ao provedor de IA. Verifique a conexão e a variável AI_API_URL.',
        );
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