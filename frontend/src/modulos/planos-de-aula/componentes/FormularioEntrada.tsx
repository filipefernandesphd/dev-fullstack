// FormularioEntrada.tsx: primeira tela do fluxo principal.
//
// Passos 1 a 3 do caso de uso: o professor descreve, em linguagem natural, o
// plano de aula desejado e submete para gerar o rascunho.

import { useState, type FormEvent } from 'react';

/**
 * Quantidade mínima de caracteres para permitir a geração do plano.
 *
 * Essa validação melhora a experiência do usuário porque evita chamadas à API
 * com descrições muito vagas, que normalmente gerariam respostas ruins.
 */
const QUANTIDADE_MINIMA_CARACTERES = 10;

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

  const quantidadeCaracteres = descricao.trim().length;

  const descricaoValida = quantidadeCaracteres >= QUANTIDADE_MINIMA_CARACTERES;

  /**
   * Trata o envio do formulário, evitando o recarregamento da página e
   * repassando a descrição para o componente pai somente quando ela é válida.
   */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!descricaoValida || carregando) {
      return;
    }

    onGerar(descricao);
  }

  return (
    <form onSubmit={aoEnviar} className="cartao formulario-principal">
      <div className="cabecalho-secao">
        <span className="etiqueta-etapa">Etapa 1 de 3</span>
        <h2>Descreva sua aula</h2>
        <p className="texto-ajuda">
          Informe o tema, duração, público-alvo e objetivo da aula para a IA
          gerar um rascunho mais útil.
        </p>
      </div>

      <label htmlFor="descricao">Descrição do plano de aula</label>

      <textarea
        id="descricao"
        rows={5}
        value={descricao}
        placeholder="Ex.: Quero uma aula de 50 minutos sobre introdução à engenharia de software para graduação."
        onChange={(evento) => setDescricao(evento.target.value)}
        aria-describedby="contador-descricao ajuda-descricao"
      />

      <div className="linha-formulario">
        <small id="contador-descricao">
          {quantidadeCaracteres} caractere(s) digitado(s)
        </small>

        {!descricaoValida && (
          <small id="ajuda-descricao" className="texto-alerta">
            Digite pelo menos {QUANTIDADE_MINIMA_CARACTERES} caracteres.
          </small>
        )}
      </div>

      {/* Exibe a mensagem de erro retornada pela API, se houver. */}
      {erro && (
        <p role="alert" className="alerta-erro">
          {erro}
        </p>
      )}

      <button type="submit" disabled={carregando || !descricaoValida}>
        {carregando ? (
          <span className="conteudo-botao">
            <span className="spinner" aria-hidden="true" />
            Gerando...
          </span>
        ) : (
          'Gerar plano'
        )}
      </button>
    </form>
  );
}

export default FormularioEntrada;