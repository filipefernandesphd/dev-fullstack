// VisualizacaoRelatorio.tsx: última tela do fluxo principal.
//
// Passo 7 do caso de uso: o sistema exibe o plano de aula em formato de
// relatório (com os dados estruturados do plano), encerrando o fluxo.

import { useState } from 'react';

import type { PlanoDeAulaFinal } from '../plano-de-aula.tipos';

/**
 * Propriedades do componente de visualização do relatório.
 */
type Props = {
  /**
   * Plano de aula final retornado pela API (título, plano e relatório).
   */
  planoFinal: PlanoDeAulaFinal;

  /**
   * Função chamada ao clicar em "Novo plano", para reiniciar o fluxo.
   */
  onReiniciar: () => void;
};

/**
 * Exibe o relatório final do plano de aula, mostrando os dados estruturados do
 * plano e, em seguida, o texto do relatório gerado pela IA.
 *
 * @param props Propriedades do componente.
 */
function VisualizacaoRelatorio({ planoFinal, onReiniciar }: Props) {
  const [mensagemAcao, setMensagemAcao] = useState<string | null>(null);

  // Dados estruturados do plano (mesmo formato do rascunho).
  const { plano } = planoFinal;

  /**
   * Copia o relatório final para a área de transferência do navegador.
   *
   * Essa ação melhora a experiência do professor porque permite levar o plano
   * rapidamente para outro editor, e-mail ou ambiente virtual de aprendizagem.
   */
  async function aoCopiarRelatorio() {
    const textoCompleto = `${planoFinal.titulo}\n\n${planoFinal.relatorio}`;

    await navigator.clipboard.writeText(textoCompleto);

    setMensagemAcao('Relatório copiado para a área de transferência.');
  }

  /**
   * Aciona a impressão nativa do navegador.
   *
   * O navegador também permite salvar como PDF, então essa opção atende tanto
   * impressão física quanto exportação simples do relatório.
   */
  function aoImprimirRelatorio() {
    window.print();
  }

  return (
    <section className="cartao relatorio-final">
      <div className="cabecalho-secao">
        <span className="etiqueta-etapa">Etapa 3 de 3</span>
        <h2>{planoFinal.titulo}</h2>
        <p className="texto-ajuda">
          Revise o relatório final, copie para outro sistema ou imprima/salve em
          PDF pelo navegador.
        </p>
      </div>

      {mensagemAcao && (
        <p role="status" className="alerta-sucesso">
          {mensagemAcao}
        </p>
      )}

      {/* Dados estruturados do plano, apresentados como um relatório. */}
      <dl className="relatorio-dados">
        <dt>Disciplina</dt>
        <dd>{plano.disciplina}</dd>

        <dt>Curso</dt>
        <dd>{plano.curso}</dd>

        <dt>Nível</dt>
        <dd>{plano.nivel}</dd>

        <dt>Duração</dt>
        <dd>{plano.duracao}</dd>

        <dt>Tema</dt>
        <dd>{plano.tema}</dd>

        <dt>Objetivos</dt>
        <dd>
          <ul>
            {plano.objetivos.map((objetivo, indice) => (
              <li key={indice}>{objetivo}</li>
            ))}
          </ul>
        </dd>

        <dt>Conteúdos</dt>
        <dd>
          <ul>
            {plano.conteudos.map((conteudo, indice) => (
              <li key={indice}>{conteudo}</li>
            ))}
          </ul>
        </dd>

        <dt>Metodologia</dt>
        <dd>{plano.metodologia}</dd>

        <dt>Recursos</dt>
        <dd>
          <ul>
            {plano.recursos.map((recurso, indice) => (
              <li key={indice}>{recurso}</li>
            ))}
          </ul>
        </dd>

        <dt>Avaliação</dt>
        <dd>{plano.avaliacao}</dd>
      </dl>

      {/* Texto corrido do relatório gerado pela IA. */}
      <h3>Relatório</h3>

      {/*
        O relatório vem como texto único com quebras de linha.
        A tag <pre> preserva esses espaços e quebras na exibição.
      */}
      <pre>{planoFinal.relatorio}</pre>

      <div className="acoes">
        <button type="button" onClick={aoCopiarRelatorio}>
          Copiar relatório
        </button>

        <button type="button" onClick={aoImprimirRelatorio}>
          Imprimir relatório
        </button>

        <button type="button" onClick={onReiniciar}>
          Novo plano
        </button>
      </div>
    </section>
  );
}

export default VisualizacaoRelatorio;