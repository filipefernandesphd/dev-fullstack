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
  const [copiado, setCopiado] = useState(false);
  // Dados estruturados do plano (mesmo formato do rascunho).
  const { plano } = planoFinal;
  //acoes para o botao de copiar relatório

  async function copiarRelatorio() {
    const textoCompleto = `
Título: ${planoFinal.titulo}

Disciplina: ${plano.disciplina}
Curso: ${plano.curso}
Nível: ${plano.nivel}
Duração: ${plano.duracao}
Tema: ${plano.tema}

Objetivos:
${plano.objetivos.map((objetivo) => `- ${objetivo}`).join('\n')}

Conteúdos:
${plano.conteudos.map((conteudo) => `- ${conteudo}`).join('\n')}

Metodologia:
${plano.metodologia}

Recursos:
${plano.recursos.map((recurso) => `- ${recurso}`).join('\n')}

Avaliação:
${plano.avaliacao}

Relatório:
${planoFinal.relatorio}
`;

    await navigator.clipboard.writeText(textoCompleto);

    setCopiado(true);

    setTimeout(() => {
      setCopiado(false);
    }, 2000);
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


      {copiado && <p className="mensagem-sucesso">Relatório copiado!</p>}

      <button type="button" onClick={copiarRelatorio}>
        Copiar relatório
      </button>    
      <button type="button" onClick={onReiniciar}>
        Novo plano
      </button>
    </section>
  );
}

export default VisualizacaoRelatorio;
