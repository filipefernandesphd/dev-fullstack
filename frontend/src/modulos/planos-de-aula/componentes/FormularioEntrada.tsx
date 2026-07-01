// FormularioEntrada.tsx: primeira tela do fluxo principal.
//
// Este componente é responsável por capturar a descrição inicial do plano de aula
// e encaminhá-la para a camada superior da aplicação (controle de fluxo).
//
// IMPORTANTE:
// Este componente NÃO deve conter regras de negócio, apenas validações simples de interface.

import { useState, type FormEvent } from 'react';

/**
 * Propriedades do componente de entrada.
 */
type Props = {
  /**
   * Função chamada ao submeter o formulário, recebendo a descrição digitada.
   *
   * POR QUÊ:
   * A responsabilidade de gerar o plano NÃO pertence ao componente de UI,
   * mas sim à camada superior (serviço/controlador).
   */
  onGerar: (descricao: string) => void;

  /**
   * Indica que uma requisição está em andamento (desabilita o botão).
   *
   * POR QUÊ:
   * Evita múltiplos envios simultâneos e melhora a experiência do usuário.
   */
  carregando: boolean;

  /**
   * Mensagem de erro a ser exibida (ou null quando não há erro).
   *
   * POR QUÊ:
   * Permite feedback claro ao usuário sem quebrar o fluxo da interface.
   */
  erro: string | null;
};

/**
 * Tela inicial: campo de texto livre + botão para gerar o rascunho.
 *
 * RESPONSABILIDADE:
 * Apenas capturar entrada do usuário e delegar ação.
 */
function FormularioEntrada({ onGerar, carregando, erro }: Props) {
  // Estado local com o texto digitado pelo professor.
  const [descricao, setDescricao] = useState('');

  /**
   * Regra de UX:
   * Define se o botão pode ser habilitado com base no tamanho mínimo do texto.
   *
   * POR QUÊ:
   * Evita chamadas desnecessárias ao backend com dados insuficientes.
   */
  const podeGerar = descricao.trim().length >= 10;

  /**
   * Trata o envio do formulário, evitando o recarregamento da página.
   *
   * POR QUÊ:
   * Mantém a aplicação SPA e delega a ação para a camada superior.
   */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    // Proteção extra de UX:
    // evita envio se já estiver carregando ou se descrição for inválida
    if (!podeGerar || carregando) return;

    onGerar(descricao);
  }

  return (
    <form onSubmit={aoEnviar}>
      <h2>Descreva sua aula</h2>

      <label htmlFor="descricao">Descrição do plano de aula</label>

      <textarea
        id="descricao"
        rows={4}
        value={descricao}
        placeholder="Ex.: Quero uma aula de 50 minutos sobre introdução à engenharia de software para graduação."
        onChange={(evento) => setDescricao(evento.target.value)}
      />

      {/* Indicador de validação no cliente (UX improvement) */}
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        {descricao.length}/10 caracteres mínimos
      </p>

      {/* Exibição de erro com acessibilidade */}
      {erro && (
        <p role="alert">
          {erro}
        </p>
      )}

      <button type="submit" disabled={carregando || !podeGerar}>
        {carregando ? 'Gerando...' : 'Gerar plano'}
      </button>
    </form>
  );
}

export default FormularioEntrada;