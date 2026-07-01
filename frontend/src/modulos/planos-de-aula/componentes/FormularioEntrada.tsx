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
   * Verifica se a descrição tem pelo menos 10 caracteres (validação no cliente).
   */
  const descricaoValida = descricao.trim().length >= 10;

  /**
   * Trata o envio do formulário, evitando o recarregamento da página e
   * repassando a descrição para o componente pai.
   */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!descricaoValida) return;
    onGerar(descricao);
  }

  return (
    <form onSubmit={aoEnviar} className="formulario-card">
      <h2>Descreva sua aula</h2>

      <div className="campo-grupo">
        <label htmlFor="descricao">Descrição do plano de aula</label>
        <textarea
          id="descricao"
          rows={4}
          value={descricao}
          placeholder="Ex.: Quero uma aula de 50 minutos sobre introdução à engenharia de software para graduação."
          onChange={(evento) => setDescricao(evento.target.value)}
          aria-describedby="contador-caracteres"
          className={descricao.length > 0 && !descricaoValida ? 'campo-invalido' : ''}
        />
        <small
          id="contador-caracteres"
          className={descricao.length > 0 && !descricaoValida ? 'contador-alerta' : ''}
        >
          {descricao.length} caractere{descricao.length !== 1 ? 's' : ''}
          {!descricaoValida && descricao.length > 0 && ' (mínimo: 10)'}
        </small>
      </div>

      {/* Exibe a mensagem de erro retornada pela API, se houver. */}
      {erro && <p role="alert" className="erro-banner">{erro}</p>}

      <button
        type="submit"
        disabled={carregando || !descricaoValida}
        className={carregando ? 'botao-carregando' : ''}
      >
        {carregando ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Gerando...
          </>
        ) : (
          'Gerar plano'
        )}
      </button>
    </form>
  );
}

export default FormularioEntrada;
