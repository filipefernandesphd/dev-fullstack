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

    /**
     * Tempo limite em milissegundos para aguardar a resposta do provedor de IA.
     * Define um teto de 30 segundos para evitar requisições infinitas ou travadas.
     */
    private readonly TEMPO_LIMITE_MS = 30000;

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
                /**
                 * Mecanismo de resiliência: aborta o fetch caso o provedor ultrapasse
                 * o limite estipulado em TIMEOUT_MS, liberando recursos do backend.
                 */
                signal: AbortSignal.timeout(this.TEMPO_LIMITE_MS)
            });

            if (!resposta.ok) {
                /**
                 * Delega o tratamento de respostas sem sucesso para uma função especializada,
                 * mapeando os códigos HTTP em exceções com mensagens claras e sem expor segredos.
                 */
                await this.tratarErroHttp(resposta);
            }

            const corpo = (await resposta.json()) as RespostaIa;

            const conteudo = corpo.choices?.[0]?.message?.content;

            if (!conteudo || typeof conteudo !== 'string') {
                throw new Error('Resposta da IA veio vazia ou em formato inválido.');
            }

            return conteudo;
        } catch (erro: any) {
            /**
             * Captura especificamente o erro lançado pelo sinalizador de timeout do Fetch.
             * Isso provê um feedback direto sobre problemas de lentidão na rede ou no modelo.
             */
            if (
                (erro instanceof DOMException && erro.name === 'AbortError') ||
                (erro instanceof Error && erro.name === 'TimeoutError')
            ) {
                throw new Error(
                    `O provedor de IA demorou muito para responder (Limite de ${this.TEMPO_LIMITE_MS / 1000}s atingido). Tente novamente.`
                );
            }
            // Repassa os outros erros de rede ou os erros customizados lançados pelo tratarErroHttp
            throw erro;
        }
    };

    /**
     * Analisa o status HTTP de uma resposta mal sucedida e lança um erro customizado e didático.
     *
     * Isola o tratamento de exceções de rede e infraestrutura do provedor, traduzindo códigos técnicos
                     * como 401, 429 e 5xx em instruções acionáveis para o desenvolvedor ou usuário.
     *
     * @param resposta Objeto de resposta do Fetch contendo o status de erro.
     * @returns Nunca retorna um valor, pois sempre dispara uma exceção.
     *
     * @throws Error Exceção correspondente ao código HTTP capturado.
     */
    private async tratarErroHttp(resposta: Response): Promise<never> {

        let detalhesErro = '';
        try {
            detalhesErro = await resposta.text();
        } catch {
            detalhesErro = 'Não foi possível ler os detalhes do erro.';
        }
        /**
         * Vá além da config: trate erros do provedor (ex.: 429 de limite de uso, timeout,
chave inválida) com mensagens claras, mantendo o formato de resposta.
         */

        switch (resposta.status) {
            case 400:
                // 400 - Bad Request: payload inválido, modelo mal formado ou estrutura fora do padrão Chat Completions
                throw new Error(
                    "Algo deu errado na requisição da IA. Verifique os dados enviados e tente novamente."
                );

            case 401:
                // 401 - Unauthorized: chave da API inválida, ausente ou expirada
                throw new Error(
                    "Erro de autenticação na IA. A chave de acesso não é válida ou expirou."
                );

            case 403:
                // 403 - Forbidden: API não habilitada ou chave sem permissão
                throw new Error(
                    "Acesso negado à IA. Verifique se sua conta tem permissão para usar o serviço."
                );

            case 404:
                // 404 - Not Found: endpoint ou modelo inexistente
                throw new Error(
                    "O serviço de IA não foi encontrado. Verifique a configuração do modelo."
                );

            case 408:
                // 408 - Request Timeout: requisição demorou além do limite do provedor
                throw new Error(
                    "A IA demorou muito para responder. Tente novamente em alguns segundos."
                );

            case 429:
                // 429 - Too Many Requests: limite de uso ou cota gratuita excedida
                throw new Error(
                    "Você atingiu o limite de uso da IA. Aguarde um momento e tente novamente."
                );

            case 500:
            case 502:
            case 503:
                // 5xx - Erro no servidor do provedor (instabilidade, queda ou manutenção)
                throw new Error(
                    "A IA está temporariamente indisponível. Tente novamente mais tarde."
                );

            default:
                // Outros erros não mapeados pelo provedor
                throw new Error(
                    `Erro inesperado ao se comunicar com a IA. Status ${resposta.status}.`
                );
        }
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