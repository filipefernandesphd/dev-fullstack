// App.tsx: componente principal que orquestra o fluxo completo do MeuPlano.AI.
//
// Etapas do fluxo principal (UC01):
//   1. Entrada: professor descreve a aula em linguagem natural.
//   2. Revisão: sistema exibe formulário com campos preenchidos pela IA.
//   3. Relatório: sistema exibe versão final do plano de aula.

import { useState } from 'react';

import FormularioEntrada from './modulos/planos-de-aula/componentes/FormularioEntrada';
import FormularioRascunho from './modulos/planos-de-aula/componentes/FormularioRascunho';
import VisualizacaoRelatorio from './modulos/planos-de-aula/componentes/VisualizacaoRelatorio';

import { planoDeAulaServico } from './modulos/planos-de-aula/plano-de-aula.servico';
import type { PlanoDeAulaRascunho, PlanoDeAulaFinal } from './modulos/planos-de-aula/plano-de-aula.tipos';

import './App.css';

/**
 * Etapas possíveis do fluxo principal.
 */
type Etapa = 'entrada' | 'rascunho' | 'relatorio';

/**
 * Configuração do indicador de etapas.
 * Cada etapa tem um rótulo e um índice para exibição visual.
 */
const ETAPAS: Array<{ chave: Etapa; rotulo: string; indice: number }> = [
  { chave: 'entrada', rotulo: 'Descrição', indice: 1 },
  { chave: 'rascunho', rotulo: 'Revisão', indice: 2 },
  { chave: 'relatorio', rotulo: 'Relatório', indice: 3 },
];

/**
 * Componente principal da aplicação MeuPlano.AI.
 *
 * Gerencia o estado global da aplicação: em qual etapa estamos,
 * qual o rascunho atual, o plano final, estado de carregamento e erros.
 */
function App() {
  // Etapa atual do fluxo
  const [etapa, setEtapa] = useState<Etapa>('entrada');

  // Rascunho atual do plano de aula (gerado ou melhorado pela IA)
  const [rascunho, setRascunho] = useState<PlanoDeAulaRascunho | null>(null);

  // Plano de aula final (gerado na última etapa)
  const [planoFinal, setPlanoFinal] = useState<PlanoDeAulaFinal | null>(null);

  // Indica se uma requisição está em andamento
  const [carregando, setCarregando] = useState(false);

  // Mensagem de erro para exibir ao usuário
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Gera o primeiro rascunho a partir da descrição em linguagem natural.
   *
   * Passos 2-4 do UC01.
   *
   * @param descricao Descrição da aula informada pelo professor.
   */
  async function gerarRascunho(descricao: string) {
    setCarregando(true);
    setErro(null);

    try {
      const rascunhoGerado = await planoDeAulaServico.gerarRascunho(descricao);
      setRascunho(rascunhoGerado);
      setEtapa('rascunho');
    } catch (erroCapturado) {
      const mensagem =
        erroCapturado instanceof Error
          ? erroCapturado.message
          : 'Erro ao gerar o rascunho do plano de aula.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  /**
   * Melhora o rascunho atual com base nas orientações adicionais do professor.
   *
   * Passo 5.2 do UC01 (fluxo alternativo).
   *
   * @param rascunhoAtual Rascunho atual do plano de aula.
   * @param orientacoes Orientações para melhoria.
   */
  async function melhorarRascunho(
    rascunhoAtual: PlanoDeAulaRascunho,
    orientacoes: string,
  ) {
    setCarregando(true);
    setErro(null);

    try {
      const rascunhoMelhorado = await planoDeAulaServico.melhorarRascunho(
        rascunhoAtual,
        orientacoes,
      );
      setRascunho(rascunhoMelhorado);
    } catch (erroCapturado) {
      const mensagem =
        erroCapturado instanceof Error
          ? erroCapturado.message
          : 'Erro ao melhorar o rascunho do plano de aula.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  /**
   * Gera a versão final do plano de aula a partir do rascunho revisado.
   *
   * Passos 6-7 do UC01.
   *
   * @param rascunhoRevisado Rascunho revisado pelo professor.
   */
  async function gerarPlanoFinal(rascunhoRevisado: PlanoDeAulaRascunho) {
    setCarregando(true);
    setErro(null);

    try {
      const planoFinalGerado =
        await planoDeAulaServico.gerarPlanoFinal(rascunhoRevisado);
      setPlanoFinal(planoFinalGerado);
      setEtapa('relatorio');
    } catch (erroCapturado) {
      const mensagem =
        erroCapturado instanceof Error
          ? erroCapturado.message
          : 'Erro ao gerar a versão final do plano de aula.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  /**
   * Reinicia o fluxo para gerar um novo plano de aula.
   */
  function reiniciar() {
    setEtapa('entrada');
    setRascunho(null);
    setPlanoFinal(null);
    setErro(null);
    setCarregando(false);
  }

  return (
    <main>
      <h1>MeuPlano.AI</h1>
      <p className="subtitulo">Gerador de planos de aula com Inteligência Artificial.</p>

      {/* Indicador visual de etapas do fluxo */}
      <nav className="indicador-etapas" aria-label="Progresso">
        {ETAPAS.map((etapaAtual) => {
          const indiceEtapaAtual = ETAPAS.findIndex((e) => e.chave === etapa);
          const isConcluida = etapaAtual.indice <= indiceEtapaAtual + 1 && etapa !== etapaAtual.chave;
          const isAtual = etapaAtual.chave === etapa;

          return (
            <span
              key={etapaAtual.chave}
              className={[
                'etapa',
                isConcluida ? 'etapa-concluida' : '',
                isAtual ? 'etapa-atual' : '',
              ].filter(Boolean).join(' ')}
              aria-current={isAtual ? 'step' : undefined}
            >
              <span className="etapa-numero">{etapaAtual.indice}</span>
              <span className="etapa-rotulo">{etapaAtual.rotulo}</span>
              {etapaAtual.indice < ETAPAS.length && (
                <span className="etapa-separador" aria-hidden="true" />
              )}
            </span>
          );
        })}
      </nav>

      {/* Exibe a etapa atual conforme o estado do fluxo */}
      {etapa === 'entrada' && (
        <FormularioEntrada
          onGerar={gerarRascunho}
          carregando={carregando}
          erro={erro}
        />
      )}

      {etapa === 'rascunho' && rascunho && (
        <FormularioRascunho
          rascunhoInicial={rascunho}
          onGerarFinal={gerarPlanoFinal}
          onMelhorar={melhorarRascunho}
          carregando={carregando}
          erro={erro}
        />
      )}

      {etapa === 'relatorio' && planoFinal && (
        <VisualizacaoRelatorio
          planoFinal={planoFinal}
          onReiniciar={reiniciar}
        />
      )}
    </main>
  );
}

export default App;
