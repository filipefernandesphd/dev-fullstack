// FormularioEntrada.tsx: primeira tela do fluxo principal.
//
// Passos 1 a 3 do caso de uso: o professor descreve, em linguagem natural, o
// plano de aula desejado e submete para gerar o rascunho.

import { useState, type FormEvent } from 'react';

import { LuTriangleAlert, LuSparkles } from 'react-icons/lu';

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
 * Número mínimo de caracteres exigido para habilitar o botão "Gerar plano".
 */
const MINIMO_CARACTERES = 10;

/**
 * Tela inicial: campo de texto livre + botão para gerar o rascunho.
 *
 * Melhorias de UX:
 * - Contador de caracteres em tempo real.
 * - Validação no cliente: desabilita o botão enquanto a descrição tiver
 *   menos de 10 caracteres.
 * - Spinner visual no botão durante o carregamento.
 * - Banner de erro destacado com ícone.
 *
 * @param props Propriedades do componente.
 */
function FormularioEntrada({ onGerar, carregando, erro }: Props) {
  // Estado local com o texto digitado pelo professor.
  const [descricao, setDescricao] = useState('');

  const podeGerar =
    !carregando && descricao.trim().length >= MINIMO_CARACTERES;

  /**
   * Trata o envio do formulário, evitando o recarregamento da página e
   * repassando a descrição para o componente pai.
   */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (podeGerar) {
      onGerar(descricao);
    }
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
        aria-describedby="contador-descricao"
      />

      <p
        id="contador-descricao"
        className={`contador-caracteres ${
          descricao.trim().length > 0 && descricao.trim().length < MINIMO_CARACTERES
            ? 'limite'
            : ''
        }`}
      >
        {descricao.trim().length}
        {descricao.trim().length < MINIMO_CARACTERES &&
          ` / ${MINIMO_CARACTERES} caracteres mínimos`}
      </p>

      {/* Exibe a mensagem de erro retornada pela API, se houver. */}
      {erro && (
        <p role="alert" className="erro-banner">
          <LuTriangleAlert aria-hidden="true" />
          {erro}
        </p>
      )}

      <button type="submit" disabled={!podeGerar}>
        {carregando ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Gerando...
          </>
        ) : (
          <><LuSparkles aria-hidden="true" /> Gerar plano</>
        )}
      </button>
    </form>
  );
}

export default FormularioEntrada;
