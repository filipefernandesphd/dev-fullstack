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
/**
 * Quantidade mínima de caracteres exigida na descrição antes de permitir a
 * geração do plano. Validação no cliente: evita chamadas à IA com textos vagos
 * demais e dá um retorno imediato ao professor.
 */
const MINIMO_CARACTERES_DESCRICAO = 10;

function FormularioEntrada({ onGerar, carregando, erro }: Props) {
  // Estado local com o texto digitado pelo professor.
  const [descricao, setDescricao] = useState('');

  // Quantidade de caracteres já digitados (ignorando espaços nas pontas).
  const quantidadeCaracteres = descricao.trim().length;

  // A descrição é válida quando atinge o mínimo de caracteres.
  const descricaoValida = quantidadeCaracteres >= MINIMO_CARACTERES_DESCRICAO;

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
        placeholder="Ex.: Crie um plano de aula para disciplina de Introdução a Banco de Dados, curso de nível Técnico utilizando taxonomia de Bloom e método ROPES, 5 aulas com 5h de duração cada."
        onChange={(evento) => setDescricao(evento.target.value)}
        aria-describedby="contador-descricao"
      />

      {/*
        Contador de caracteres: orienta o professor sobre o mínimo exigido.
        aria-live="polite" faz leitores de tela anunciarem a mudança sem
        interromper o que já estava sendo lido.
      */}
      <p
        id="contador-descricao"
        className={`contador${descricaoValida ? '' : ' contador--insuficiente'}`}
        aria-live="polite"
      >
        {quantidadeCaracteres}/{MINIMO_CARACTERES_DESCRICAO} caracteres mínimos
      </p>

      {/* Exibe a mensagem de erro retornada pela API, se houver. */}
      {erro && (
        <p role="alert" className="banner-erro">
          <span aria-hidden="true">⚠️</span> {erro}
        </p>
      )}

      {/*
        O botão fica desabilitado durante o carregamento OU enquanto a descrição
        não atinge o mínimo de caracteres. Mantemos EXATAMENTE o texto
        "Gerar plano" no estado normal (os testes dependem desse rótulo).
        O spinner é apenas decorativo (aria-hidden), não altera o nome acessível.
      */}
      <button type="submit" disabled={carregando || !descricaoValida}>
        {carregando ? (
          <>
            <span className="spinner" aria-hidden="true" /> Gerando...
          </>
        ) : (
          'Gerar plano'
        )}
      </button>
    </form>
  );
}

export default FormularioEntrada;
