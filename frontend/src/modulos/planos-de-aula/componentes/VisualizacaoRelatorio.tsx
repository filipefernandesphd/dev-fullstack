// VisualizacaoRelatorio.tsx: última tela do fluxo principal.
//
// Passo 7 do caso de uso: o sistema exibe o plano de aula em formato de
// relatório (com os dados estruturados do plano), encerrando o fluxo.
//
// IMPORTANTE:
// Este componente é exclusivamente de apresentação (read-only).
// Não contém regras de negócio nem manipulação de dados complexos.

import type { PlanoDeAulaFinal } from '../plano-de-aula.tipos';

/**
 * Propriedades do componente de visualização do relatório.
 */
type Props = {
  /**
   * Plano de aula final retornado pela API.
   *
   * POR QUÊ:
   * Centraliza em um único objeto todos os dados necessários para exibição.
   */
  planoFinal: PlanoDeAulaFinal;

  /**
   * Função chamada ao clicar em "Novo plano".
   */
  onReiniciar: () => void;
};

/**
 * Exibe o relatório final do plano de aula.
 *
 * RESPONSABILIDADE:
 * Apenas renderizar dados já processados pela camada de serviço.
 */
function VisualizacaoRelatorio({ planoFinal, onReiniciar }: Props) {
  const { plano } = planoFinal;

  /**
   * Estado leve de feedback para ação de copiar relatório.
   */
  function copiarRelatorio() {
    navigator.clipboard.writeText(planoFinal.relatorio);
    alert('Relatório copiado com sucesso!');
  }

  /**
   * UX: evita erro caso arrays venham vazios ou indefinidos.
   */
  const objetivos = plano.objetivos ?? [];
  const conteudos = plano.conteudos ?? [];
  const recursos = plano.recursos ?? [];

  return (
    <section>
      <h2>{planoFinal.titulo}</h2>

      {/* BOTÕES DE AÇÃO (UX MELHORADA) */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={copiarRelatorio}>
          Copiar relatório
        </button>

        <button type="button" onClick={onReiniciar}>
          Novo plano
        </button>
      </div>

      {/* RELATÓRIO ESTRUTURADO */}
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
            {objetivos.map((objetivo, indice) => (
              <li key={indice}>{objetivo}</li>
            ))}
          </ul>
        </dd>

        <dt>Conteúdos</dt>
        <dd>
          <ul>
            {conteudos.map((conteudo, indice) => (
              <li key={indice}>{conteudo}</li>
            ))}
          </ul>
        </dd>

        <dt>Metodologia</dt>
        <dd>{plano.metodologia}</dd>

        <dt>Recursos</dt>
        <dd>
          <ul>
            {recursos.map((recurso, indice) => (
              <li key={indice}>{recurso}</li>
            ))}
          </ul>
        </dd>

        <dt>Avaliação</dt>
        <dd>{plano.avaliacao}</dd>
      </dl>

      {/* RELATÓRIO TEXTUAL FINAL */}
      <h3>Relatório</h3>

      <pre
        style={{
          whiteSpace: 'pre-wrap',
          background: '#f5f5f5',
          padding: 12,
          borderRadius: 6,
        }}
        aria-label="Relatório final do plano de aula"
      >
        {planoFinal.relatorio}
      </pre>
    </section>
  );
}

export default VisualizacaoRelatorio;
