// App.tsx: componente raiz que ORQUESTRA o fluxo principal.
//
// Etapas (espelham o caso de uso):
//   entrada    -> professor descreve a aula (passos 1-3)
//   formulario -> revisa o rascunho preenchido (passos 4-6)
//   relatorio  -> vê o plano final (passo 7)
//
// O App não conhece detalhes de HTTP: ele apenas chama o serviço
// (plano-de-aula.servico) e controla qual tela mostrar conforme o estado.

import { useState } from 'react';

// Instância pronta do cliente HTTP (camada de serviço).
import { planoDeAulaServico } from './modulos/planos-de-aula/plano-de-aula.servico';

// Tipos do domínio.
import type {
  PlanoDeAulaRascunho,
  PlanoDeAulaFinal,
} from './modulos/planos-de-aula/plano-de-aula.tipos';

// Componentes de cada etapa.
import FormularioEntrada from './modulos/planos-de-aula/componentes/FormularioEntrada';
import FormularioRascunho from './modulos/planos-de-aula/componentes/FormularioRascunho';
import VisualizacaoRelatorio from './modulos/planos-de-aula/componentes/VisualizacaoRelatorio';
import IndicadorEtapas from './modulos/planos-de-aula/componentes/IndicadorEtapas';

/**
 * Etapas possíveis do fluxo principal.
 */
type Etapa = 'entrada' | 'formulario' | 'relatorio';

/**
 * Componente raiz da aplicação MeuPlano.AI.
 */
function App() {
  // Etapa atual do fluxo.
  const [etapa, setEtapa] = useState<Etapa>('entrada');

  // Rascunho gerado pela IA (disponível a partir da etapa "formulario").
  const [rascunho, setRascunho] = useState<PlanoDeAulaRascunho | null>(null);

  // Versão do rascunho: muda a cada melhoria para forçar o formulário a
  // recarregar os campos com o novo conteúdo (via prop "key").
  const [versaoRascunho, setVersaoRascunho] = useState(0);

  // Plano final (disponível na etapa "relatorio").
  const [planoFinal, setPlanoFinal] = useState<PlanoDeAulaFinal | null>(null);

  // Indica requisição em andamento (para desabilitar botões / mostrar "Gerando...").
  const [carregando, setCarregando] = useState(false);

  // Mensagem de erro vinda da API (ou null).
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Gera o rascunho a partir da descrição e avança para a etapa de revisão.
   */
  async function aoGerarRascunho(descricao: string) {
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await planoDeAulaServico.gerarRascunho(descricao);
      setRascunho(resultado);
      setEtapa('formulario');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  /**
   * Melhora o rascunho atual usando as orientações do professor, permanecendo
   * na etapa de revisão (com os campos atualizados).
   */
  async function aoMelhorar(
    rascunhoAtual: PlanoDeAulaRascunho,
    orientacoes: string,
  ) {
    setCarregando(true);
    setErro(null);

    try {
      const melhorado = await planoDeAulaServico.melhorarRascunho(
        rascunhoAtual,
        orientacoes,
      );
      setRascunho(melhorado);
      // Incrementa a versão para o formulário recarregar com o novo rascunho.
      setVersaoRascunho((versao) => versao + 1);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  /**
   * Gera a versão final a partir do rascunho revisado e mostra o relatório.
   */
  async function aoGerarFinal(rascunhoRevisado: PlanoDeAulaRascunho) {
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await planoDeAulaServico.gerarPlanoFinal(
        rascunhoRevisado,
      );
      setPlanoFinal(resultado);
      setEtapa('relatorio');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  /**
   * Reinicia o fluxo, voltando à tela inicial.
   */
  function aoReiniciar() {
    setEtapa('entrada');
    setRascunho(null);
    setPlanoFinal(null);
    setErro(null);
  }

  return (
    <main className="app">
      <h1>MeuPlano.AI</h1>
      <IndicadorEtapas etapaAtual={etapa} />

      {/* Etapa 1: entrada em linguagem natural */}
      {etapa === 'entrada' && (
        <FormularioEntrada
          onGerar={aoGerarRascunho}
          carregando={carregando}
          erro={erro}
        />
      )}

      {/* Etapa 2: revisão do rascunho */}
      {etapa === 'formulario' && rascunho && (
        <FormularioRascunho
          key={versaoRascunho}
          rascunhoInicial={rascunho}
          onGerarFinal={aoGerarFinal}
          onMelhorar={aoMelhorar}
          carregando={carregando}
          erro={erro}
        />
      )}

      {/* Etapa 3: relatório final */}
      {etapa === 'relatorio' && planoFinal && (
        <VisualizacaoRelatorio
          planoFinal={planoFinal}
          onReiniciar={aoReiniciar}
        />
      )}
    </main>
  );
}

export default App;
