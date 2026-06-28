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
// Exigimos um mínimo de caracteres antes de deixar gerar o plano. A ideia é evitar
// que o professor mande uma descrição vazia ou curta demais pra IA trabalhar - aí o
// botão fica desabilitado e o contador avisa quanto falta. O valor 10 é o mesmo
// sugerido no enunciado da atividade.
const MINIMO_CARACTERES = 10;

function FormularioEntrada({ onGerar, carregando, erro }: Props) {
  // Estado local com o texto digitado pelo professor.
  const [descricao, setDescricao] = useState('');

  const quantidade = descricao.trim().length;
  const descricaoValida = quantidade >= MINIMO_CARACTERES;

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
    <form onSubmit={aoEnviar}>
      <h2>Descreva sua aula</h2>

      <label htmlFor="descricao">Descrição do plano de aula</label>
      <textarea
        id="descricao"
        rows={4}
        value={descricao}
        aria-describedby="ajuda-descricao"
        placeholder="Ex.: Quero uma aula de 50 minutos sobre introdução à engenharia de software para graduação."
        onChange={(evento) => setDescricao(evento.target.value)}
      />

      <p
        id="ajuda-descricao"
        className={`contador ${descricaoValida ? 'contador--ok' : ''}`}
      >
        {descricaoValida
          ? `${quantidade} caracteres`
          : `Faltam ${MINIMO_CARACTERES - quantidade} caractere(s) para gerar o plano`}
      </p>

      {/* Exibe a mensagem de erro retornada pela API, se houver. */}
      {erro && (
        <p role="alert" className="alerta">
          {erro}
        </p>
      )}

      <button type="submit" disabled={carregando || !descricaoValida}>
        {carregando && <span className="spinner" aria-hidden="true" />}
        {carregando ? 'Gerando...' : 'Gerar plano'}
      </button>
    </form>
  );
}

export default FormularioEntrada;
