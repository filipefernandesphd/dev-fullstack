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

  // Guarda se acabamos de copiar pra trocar o texto do botão por "Copiado!" por
  // alguns segundos. É só um feedback visual rápido, depois volta ao normal.
  const [copiado, setCopiado] = useState(false);

  async function aoCopiar() {
    try {
      // Copia título + relatório de uma vez pra área de transferência.
      await navigator.clipboard.writeText(
        `${planoFinal.titulo}\n\n${planoFinal.relatorio}`,
      );
      setCopiado(true);
      // Volta o botão ao texto original depois de 2s.
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // navigator.clipboard pode falhar (sem https ou permissão negada). Como copiar
      // é um extra, a gente engole o erro em vez de quebrar a tela do relatório.
    }
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

      <div className="acoes acoes--relatorio">
        <button type="button" onClick={onReiniciar}>
          Novo plano
        </button>

        <button type="button" className="botao-secundario" onClick={aoCopiar}>
          {copiado ? 'Copiado!' : 'Copiar plano'}
        </button>

        <button
          type="button"
          className="botao-secundario"
          onClick={() => window.print()}
        >
          Imprimir
        </button>
      </div>
    </section>
  );
}

export default VisualizacaoRelatorio;
