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
  
  // Estado para feedback visual da cópia
  const [copiado, setCopiado] = useState(false);

  /**
   * Melhoria de UX: Ação de exportação do plano gerado.
   * Formata os dados estruturados e o texto corrido para facilitar o uso.
   */
  async function copiarPlano() {
    const textoParaCopiar = `
TÍTULO: ${planoFinal.titulo}
-----------------------------------------
Disciplina: ${plano.disciplina}
Curso: ${plano.curso}
Nível: ${plano.nivel}
Duração: ${plano.duracao}
Tema: ${plano.tema}

Objetivos:
${plano.objetivos.map(o => `- ${o}`).join('\n')}

Conteúdos:
${plano.conteudos.map(c => `- ${c}`).join('\n')}

Metodologia: ${plano.metodologia}

Recursos:
${plano.recursos.map(r => `- ${r}`).join('\n')}

Avaliação: ${plano.avaliacao}

RELATÓRIO FINAL:
${planoFinal.relatorio}
    `.trim();

    try {
      await navigator.clipboard.writeText(textoParaCopiar);
      setCopiado(true);
      // Retorna o botão ao estado original após 3 segundos
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error('Falha ao copiar o plano:', err);
    }
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
      {/* Adicionada formatação visual extra para melhorar a leitura do texto longo */}
      <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        {planoFinal.relatorio}
      </pre>

      {/* Container de Ações */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {/* TEXTO IMUTÁVEL: 'Novo plano' mantido para passar nos testes E2E/Integração */}
        <button 
          type="button" 
          onClick={onReiniciar}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Novo plano
        </button>
        
        {/* Melhoria de UX: Ações no relatório (Exportação ágil) */}
        <button 
          type="button" 
          onClick={copiarPlano}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: copiado ? '#166534' : '#2563eb',
            color: '#fff',
            border: 'none',
            transition: 'background-color 0.3s'
          }}
        >
          {copiado ? '✓ Copiado com sucesso!' : '📋 Copiar Plano de Aula'}
        </button>
      </div>
    </section>
  );
}

export default VisualizacaoRelatorio;
