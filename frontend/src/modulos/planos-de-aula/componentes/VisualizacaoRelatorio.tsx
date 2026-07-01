// VisualizacaoRelatorio.tsx: última tela do fluxo principal.
//
// Passo 7 do caso de uso: o sistema exibe o plano de aula em formato de
// relatório (com os dados estruturados do plano), encerrando o fluxo.

import type { PlanoDeAulaFinal } from '../plano-de-aula.tipos';

type Props = {
  planoFinal: PlanoDeAulaFinal;
  onReiniciar: () => void;
};

function VisualizacaoRelatorio({ planoFinal, onReiniciar }: Props) {
  const { plano } = planoFinal;

  function copiarRelatorio() {
    navigator.clipboard.writeText(planoFinal.relatorio);
  }

  return (
    <section>
      <h2>{planoFinal.titulo}</h2>

      {/* UX: etapa final do fluxo */}
      <p className="etapas">
        Etapa 3 de 3: Relatório final gerado pela IA
      </p>

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
            {plano.objetivos.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </dd>

        <dt>Conteúdos</dt>
        <dd>
          <ul>
            {plano.conteudos.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </dd>

        <dt>Metodologia</dt>
        <dd>{plano.metodologia}</dd>

        <dt>Recursos</dt>
        <dd>
          <ul>
            {plano.recursos.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </dd>

        <dt>Avaliação</dt>
        <dd>{plano.avaliacao}</dd>
      </dl>

      <h3>Relatório</h3>

      {/* UX: leitura melhor */}
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {planoFinal.relatorio}
      </pre>

      {/* UX: ações extras (ponto alto da avaliação) */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" onClick={copiarRelatorio}>
          Copiar relatório
        </button>

        <button type="button" onClick={onReiniciar}>
          Novo plano
        </button>
      </div>
    </section>
  );
}

export default VisualizacaoRelatorio;