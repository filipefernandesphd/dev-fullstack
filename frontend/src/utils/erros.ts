/**
 * Mapeia erros da API para mensagens amigáveis ao usuário
 * 
 * Este arquivo centraliza o tratamento de erros para garantir
 * que o usuário veja mensagens claras e acionáveis.
 * 
 * IMPORTANTE: Todos os erros também são logados no console
 * para auxiliar o desenvolvedor na depuração.
 */

type ErroMapeado = {
  mensagem: string;
  acao?: string;
  nivel: 'info' | 'aviso' | 'erro';
  codigo?: string; // Para referência do desenvolvedor
};

/**
 * Mapeia erros HTTP e mensagens da IA para mensagens amigáveis
 */
export function mapearErroParaUsuario(erro: unknown): ErroMapeado {
  // Log do erro completo no console (apenas em desenvolvimento)
  if (import.meta.env.DEV) {
    console.group('MAPEAMENTO DE ERRO');
    console.log('Erro bruto:', erro);
    console.log('Tipo:', typeof erro);
    if (erro instanceof Error) {
      console.log('Mensagem:', erro.message);
      console.log('Stack:', erro.stack);
    }
    console.groupEnd();
  }

  // Erro desconhecido (fallback)
  if (!(erro instanceof Error)) {
    return {
      mensagem: 'Ocorreu um erro inesperado.',
      acao: 'Tente novamente em alguns instantes.',
      nivel: 'erro',
      codigo: 'ERR_UNKNOWN'
    };
  }

  const mensagem = erro.message;

  // --- Erros da IA (Gemini/Ollama) ---

  // 503 - Serviço indisponível
  if (mensagem.includes('503') || mensagem.includes('UNAVAILABLE')) {
    console.warn('Serviço de IA indisponível (503)');
    return {
      mensagem: 'O serviço de IA está temporariamente sobrecarregado.',
      acao: 'Tente novamente em alguns minutos. O problema geralmente é temporário.',
      nivel: 'aviso',
      codigo: 'ERR_IA_503'
    };
  }

  // 429 - Limite de requisições excedido
  if (mensagem.includes('429') || mensagem.includes('quota') || mensagem.includes('exceeded')) {
    console.warn('Limite de uso da IA excedido (429)');
    return {
      mensagem: 'Você atingiu o limite de uso da IA por hoje.',
      acao: 'Aguarde até amanhã para continuar usando. O limite é renovado diariamente.',
      nivel: 'aviso',
      codigo: 'ERR_IA_429'
    };
  }

  // 404 - Modelo não encontrado
  if (mensagem.includes('404') || mensagem.includes('not found')) {
    console.error('Modelo de IA não encontrado (404)');
    return {
      mensagem: 'O modelo de IA selecionado não está disponível.',
      acao: 'Entre em contato com o suporte para verificar a configuração.',
      nivel: 'erro',
      codigo: 'ERR_IA_404'
    };
  }

  // 401/403 - Problemas de autenticação/chave
  if (mensagem.includes('401') || mensagem.includes('403') || mensagem.includes('API key')) {
    console.error('Erro de autenticação na IA (401/403)');
    console.error('Verifique a chave API no arquivo .env.development');
    return {
      mensagem: 'Problema de autenticação com o serviço de IA.',
      acao: 'A equipe de suporte já foi notificada para resolver o problema.',
      nivel: 'erro',
      codigo: 'ERR_IA_AUTH'
    };
  }

  // Timeout - Demorou muito para responder
  if (mensagem.includes('timeout') || mensagem.includes('Timed out')) {
    console.warn('Timeout na IA');
    return {
      mensagem: 'A IA está demorando mais que o esperado para responder.',
      acao: 'Tente novamente com uma descrição mais curta ou em outro momento.',
      nivel: 'aviso',
      codigo: 'ERR_IA_TIMEOUT'
    };
  }

  // --- Erros do MongoDB ---

  // Falha na conexão com o banco
  if (mensagem.includes('MongoDB') || mensagem.includes('connection') || mensagem.includes('ECONNREFUSED')) {
    console.warn('Falha na conexão com MongoDB');
    console.warn('Verifique se o container mongodb está rodando');
    return {
      mensagem: 'Não foi possível conectar ao banco de dados.',
      acao: 'Seus planos ainda estão sendo gerados, mas a lista de planos salvos pode não estar disponível no momento.',
      nivel: 'aviso',
      codigo: 'ERR_DB_CONNECTION'
    };
  }

  // --- Erros de validação ---

  // Descrição muito curta
  if (mensagem.includes('10 caracteres') || mensagem.includes('mínimo')) {
    console.info('Descrição muito curta');
    return {
      mensagem: 'A descrição da aula precisa ser mais detalhada.',
      acao: 'Descreva sua aula com pelo menos 10 caracteres para a IA entender melhor o que você precisa.',
      nivel: 'info',
      codigo: 'ERR_VALIDATION_SHORT'
    };
  }

  // Campos obrigatórios faltando
  if (mensagem.includes('obrigatório') || mensagem.includes('required')) {
    console.info('Campos obrigatórios faltando');
    return {
      mensagem: 'Parece que faltam algumas informações.',
      acao: 'Preencha todos os campos do formulário antes de continuar.',
      nivel: 'info',
      codigo: 'ERR_VALIDATION_REQUIRED'
    };
  }

  // --- Erros de rede ---

  // Sem internet
  if (mensagem.includes('Failed to fetch') || mensagem.includes('NetworkError')) {
    console.error('Erro de rede');
    console.error('Verifique sua conexão com a internet');
    return {
      mensagem: 'Não foi possível conectar ao servidor.',
      acao: 'Verifique sua conexão com a internet e tente novamente.',
      nivel: 'erro',
      codigo: 'ERR_NETWORK'
    };
  }

  // --- Fallback para qualquer outro erro ---
  console.error('Erro não mapeado');
  console.error('Mensagem:', mensagem);
  return {
    mensagem: 'Ops! Algo não saiu como esperado.',
    acao: 'Tente recarregar a página. Se o problema persistir, entre em contato com o suporte.',
    nivel: 'erro',
    codigo: 'ERR_FALLBACK'
  };
}