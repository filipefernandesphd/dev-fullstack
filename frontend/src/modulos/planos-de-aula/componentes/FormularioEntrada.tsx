// FormularioEntrada.tsx: primeira tela do fluxo principal.
//
// Passos 1 a 3 do caso de uso: o professor descreve, em linguagem natural, o
// plano de aula desejado e submete para gerar o rascunho.

import { useState, type FormEvent } from 'react';

/**
 * Propriedades do componente de entrada.
 */
type Props = {
  /**
   * Função chamada ao submeter o formulário, recebendo a descrição digitada.
   */
  onGerar: (descricao: string) => void;

  /**
   * Indica que uma requisição está em andamento (desabilita o botão).
   */
  carregando: boolean;

  /**
   * Mensagem de erro a ser exibida (ou null quando não há erro).
   */
  erro: string | null;
};

/**
 * Tela inicial: campo de texto livre + botão para gerar o rascunho.
 *
 * @param props Propriedades do componente.
 */
function FormularioEntrada({ onGerar, carregando, erro }: Props) {
  // Estado local com o texto digitado pelo professor.
  const [descricao, setDescricao] = useState('');

  /**
   * Trata o envio do formulário, evitando o recarregamento da página e
   * repassando a descrição para o componente pai.
   */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
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

      <p className="contador">
        {descricao.length}/10 caracteres mínimos
      </p>

      {/* Exibe a mensagem de erro retornada pela API, se houver. */}
      {erro && <p role="alert">{erro}</p>}


      <button type="submit" disabled={carregando || descricao.trim().length < 10} > {carregando ? 'Gerando...' : 'Gerar plano'} </button>

      
    </form>
  );
}

export default FormularioEntrada;
