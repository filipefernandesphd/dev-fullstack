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
 * Modificado para atender à especificação "Ações no relatório" da Seção 6.3:
 * - Implementado um botão acessível para copiar o conteúdo textual gerado pela IA.
 * - Fornece um feedback temporário de sucesso ("Copiado!") após a transferência[cite: 83].
 *
 * @param props Propriedades do componente.
 */
function VisualizacaoRelatorio({ planoFinal, onReiniciar }: Props) {
  // Dados estruturados do plano (mesmo formato do rascunho).
  const { plano } = planoFinal;

  // Estado local para controlar a exibição temporária de confirmação do clipboard.
  const [copiado, setCopiado] = useState(false);

  /**
   * Manipulador que copia o texto consolidado do relatório para a área de transferência 
   * do sistema operacional através da API assíncrona do navegador.
   */
  async function aoCopiarTexto() {
    try {
      await navigator.clipboard.writeText(planoFinal.relatorio);
      setCopiado(true);
      
      // Reseta o estado do botão após 3 segundos para permitir novas interações visuais.
      setTimeout(() => {
        setCopiado(false);
      }, 3000);
    } catch (erroClipboard) {
      console.error('Falha ao acessar o clipboard do navegador:', erroClipboard);
    }
  }

  return (
    <section className="visualizacao-relatorio">
      <h2>{planoFinal.titulo}</h2>

      {/* MELHORIA DE UX: BARRA DE FERRAMENTAS/AÇÕES COMPLEMENTARES 
        Por que isto está aqui? Atende à exigência da Seção 6.3, permitindo ao professor 
        exportar o texto refinado para repositórios externos, editores de texto ou e-mails.
      */}
      <div className="painel-acoes-relatorio">
        <button 
          type="button" 
          onClick={aoCopiarTexto} 
          className={`botao-copiar ${copiado ? 'sucesso' : ''}`}
          aria-live="polite"
        >
          {copiado ? '✓ Copiado para a área de transferência!' : '📋 Copiar texto do relatório'}
        </button>
      </div>

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
      <pre className="bloco-relatorio-texto">{planoFinal.relatorio}</pre>

      {/* ATENÇÃO: O rótulo "Novo plano" foi mantido idêntico conforme estipulado 
        nas regras inegociáveis do projeto didático[cite: 80].
      */}
      <button type="button" onClick={onReiniciar}>
        Novo plano
      </button>
    </section>
  );
}

export default VisualizacaoRelatorio;