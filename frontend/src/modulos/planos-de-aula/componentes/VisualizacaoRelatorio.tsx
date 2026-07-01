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
  // Estado para feedback visual ao copiar o relatório.
  const [copiado, setCopiado] = useState(false);

  // Dados estruturados do plano (mesmo formato do rascunho).
  const { plano } = planoFinal;

  /**
   * Copia o texto do relatório para a área de transferência.
   * Exibe feedback visual por 2 segundos.
   */
  async function copiarRelatorio() {
    try {
      await navigator.clipboard.writeText(planoFinal.relatorio);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback para navegadores sem suporte à API clipboard.
      const areaTexto = document.createElement('textarea');
      areaTexto.value = planoFinal.relatorio;
      areaTexto.style.position = 'fixed';
      areaTexto.style.opacity = '0';
      document.body.appendChild(areaTexto);
      areaTexto.select();
      document.execCommand('copy');
      document.body.removeChild(areaTexto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  return (
    <section className="relatorio-container">
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
      <pre className="relatorio-texto">{planoFinal.relatorio}</pre>

      <div className="acoes-relatorio">
        <button type="button" onClick={copiarRelatorio} className="botao-secundario">
          {copiado ? 'Copiado!' : 'Copiar relatório'}
        </button>

        <button type="button" onClick={onReiniciar} className="botao-primario">
          Novo plano
        </button>
      </div>
    </section>
  );
}

export default VisualizacaoRelatorio;
