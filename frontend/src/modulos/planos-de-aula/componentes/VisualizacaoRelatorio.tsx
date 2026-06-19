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
  // Dados estruturados do plano (mesmo formato do rascunho).
  const { plano } = planoFinal;

  // Feedback temporário exibido após copiar o relatório para a área de
  // transferência (volta a null após alguns segundos).
  const [copiado, setCopiado] = useState(false);

  /**
   * Copia o texto do relatório para a área de transferência usando a API
   * nativa do navegador. Em caso de falha (ou navegador sem suporte), apenas
   * ignora silenciosamente — é uma ação de conveniência.
   */
  async function aoCopiar() {
    try {
      await navigator.clipboard.writeText(planoFinal.relatorio);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Sem suporte à área de transferência: nada a fazer.
    }
  }

  /**
   * Abre a caixa de diálogo de impressão do navegador, permitindo imprimir ou
   * salvar o plano como PDF.
   */
  function aoImprimir() {
    window.print();
  }

  return (
    <section>
      <h2>{planoFinal.titulo}</h2>

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

      {/*
        Ações sobre o relatório. "Novo plano" mantém EXATAMENTE esse rótulo
        (os testes dependem dele). "Copiar" e "Imprimir" são ações novas de
        conveniência. A classe "acoes" alinha os botões lado a lado.
      */}
      <div className="acoes">
        <button type="button" onClick={aoCopiar}>
          {copiado ? 'Copiado!' : 'Copiar'}
        </button>

        <button type="button" onClick={aoImprimir}>
          Imprimir
        </button>

        <button type="button" onClick={onReiniciar}>
          Novo plano
        </button>
      </div>
    </section>
  );
}

export default VisualizacaoRelatorio;
