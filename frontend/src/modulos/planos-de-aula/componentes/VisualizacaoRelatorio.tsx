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
  /** Plano de aula final retornado pela API. */
  planoFinal: PlanoDeAulaFinal;

  /** Função chamada ao clicar em "Novo plano". */
  onReiniciar: () => void;
};

/**
 * Exibe o relatório final do plano de aula.
 */
function VisualizacaoRelatorio({ planoFinal, onReiniciar }: Props) {
  const { plano } = planoFinal;
  const [copiado, setCopiado] = useState(false);

  /**
   * Copia o relatório para a área de transferência (Melhoria 8)
   */
  async function aoCopiar() {
    try {
      await navigator.clipboard.writeText(planoFinal.relatorio);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback: selecionar o texto manualmente
      const texto = document.querySelector('.relatorio-texto');
      if (texto) {
        const range = document.createRange();
        range.selectNode(texto);
        const selecao = window.getSelection();
        selecao?.removeAllRanges();
        selecao?.addRange(range);
        document.execCommand('copy');
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    }
  }

  return (
    <section>
      <div className="relatorio-header">
        <h2>Relatório Final</h2>
        <span className="badge-concluido">Concluído</span>
      </div>

      <h3>{planoFinal.titulo}</h3>

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

      <h3>Relatório</h3>
      <div className="relatorio-texto">
        {planoFinal.relatorio.split('\n').map((paragrafo, i) => (
          <p key={i}>{paragrafo || '\u00A0'}</p>
        ))}
      </div>

      <div className="relatorio-acoes">
        <button
          type="button"
          className="btn-copiar"
          onClick={aoCopiar}
          aria-label="Copiar relatório"
        >
          {copiado ? 'Copiado!' : 'Copiar relatório'}
        </button>

        <button
          type="button"
          className="btn-novo"
          onClick={onReiniciar}
        >
          Novo plano
        </button>
      </div>
    </section>
  );
}

export default VisualizacaoRelatorio;