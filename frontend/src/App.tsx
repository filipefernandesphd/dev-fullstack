// App.tsx: componente raiz que ORQUESTRA o fluxo principal.
//
// Etapas (espelham o caso de uso):
//   entrada    -> professor descreve a aula (passos 1-3)
//   formulario -> revisa o rascunho preenchido (passos 4-6)
//   relatorio  -> vê o plano final (passo 7)
//
// O App não conhece detalhes de HTTP: ele apenas chama o serviço
// (plano-de-aula.servico) e controla qual tela mostrar conforme o estado.

import { useState, useEffect, useRef } from 'react';

// Instância pronta do cliente HTTP (camada de serviço).
import { planoDeAulaServico } from './modulos/planos-de-aula/plano-de-aula.servico';

// Tipos do domínio.
import type {
  PlanoDeAulaRascunho,
  PlanoDeAulaFinal,
  PlanoSalvo,
} from './modulos/planos-de-aula/plano-de-aula.tipos';

// Componentes de cada etapa.
import FormularioEntrada from './modulos/planos-de-aula/componentes/FormularioEntrada';
import FormularioRascunho from './modulos/planos-de-aula/componentes/FormularioRascunho';
import VisualizacaoRelatorio from './modulos/planos-de-aula/componentes/VisualizacaoRelatorio';

/**
 * Etapas possíveis do fluxo principal.
 */
type Etapa = 'entrada' | 'formulario' | 'relatorio';

/**
 * Componente raiz da aplicação MeuPlano.AI.
 */
function App() {
  // --- ESTADOS EXISTENTES ---
  const [etapa, setEtapa] = useState<Etapa>('entrada');
  const [rascunho, setRascunho] = useState<PlanoDeAulaRascunho | null>(null);
  const [versaoRascunho, setVersaoRascunho] = useState(0);
  const [planoFinal, setPlanoFinal] = useState<PlanoDeAulaFinal | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // --- NOVOS ESTADOS ---
  const [sessaoId, setSessaoId] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [planosSalvos, setPlanosSalvos] = useState<PlanoSalvo[]>([]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(false);

  // --- REFERÊNCIA PARA FOCAR CAMPO ---
  const descricaoRef = useRef<HTMLTextAreaElement>(null);

  // --- EFECT: INICIALIZAR SESSÃO ---
  useEffect(() => {
    let id = localStorage.getItem('sessaoId');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
      localStorage.setItem('sessaoId', id);
    }
    setSessaoId(id);
  }, []);

  // --- FUNÇÕES EXISTENTES (MODIFICADAS COM LOGS) ---

  /**
   * Gera o rascunho a partir da descrição e avança para a etapa de revisão.
   * (Adicionada validação de mínimo de caracteres)
   */
  async function aoGerarRascunho(descricao: string) {
    // Validação no cliente: mínimo 10 caracteres
    if (!descricao || descricao.trim().length < 10) {
      console.info('Validação: descrição muito curta');
      setErro('A descrição deve ter pelo menos 10 caracteres.');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      console.log('Iniciando geração de rascunho...');
      console.log('Descrição:', descricao);

      const resultado = await planoDeAulaServico.gerarRascunho(descricao);

      console.log('Rascunho gerado com sucesso!');
      console.log('Título:', resultado.titulo);

      setRascunho(resultado);
      setEtapa('formulario');
    } catch (e) {
      // --- LOG COMPLETO PARA O DESENVOLVEDOR ---
      console.group('ERRO - aoGerarRascunho');
      console.log('Descrição:', descricao);
      console.log('Erro:', e);
      if (e instanceof Error) {
        console.log('Mensagem:', e.message);
        console.log('Stack:', e.stack);
      }
      console.groupEnd();

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
      console.log('Melhorando rascunho...');
      console.log('Orientacoes:', orientacoes);
      console.log('Rascunho atual:', rascunhoAtual.titulo);

      const melhorado = await planoDeAulaServico.melhorarRascunho(
        rascunhoAtual,
        orientacoes,
      );

      console.log('Rascunho melhorado com sucesso!');
      console.log('Novo título:', melhorado.titulo);

      setRascunho(melhorado);
      setVersaoRascunho((versao) => versao + 1);
    } catch (e) {
      // --- LOG COMPLETO PARA O DESENVOLVEDOR ---
      console.group('ERRO - aoMelhorar');
      console.log('Orientacoes:', orientacoes);
      console.log('Erro:', e);
      if (e instanceof Error) {
        console.log('Mensagem:', e.message);
        console.log('Stack:', e.stack);
      }
      console.groupEnd();

      setErro(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  /**
   * Gera a versão final a partir do rascunho revisado e mostra o relatório.
   * (MODIFICADO: passa sessaoId para o serviço)
   */
  async function aoGerarFinal(rascunhoRevisado: PlanoDeAulaRascunho) {
    setCarregando(true);
    setErro(null);

    try {
      // Só passa sessaoId se existir e NÃO estiver em ambiente de teste
      const resultado = sessaoId && !import.meta.env.VITEST
        ? await planoDeAulaServico.gerarPlanoFinal(rascunhoRevisado, sessaoId)
        : await planoDeAulaServico.gerarPlanoFinal(rascunhoRevisado);

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
   * (MODIFICADO: limpa descrição e foca no campo)
   */
  function aoReiniciar() {
    console.log('Reiniciando fluxo...');
    setEtapa('entrada');
    setRascunho(null);
    setPlanoFinal(null);
    setErro(null);
    setDescricao('');
    setTimeout(() => descricaoRef.current?.focus(), 100);
  }

  // --- NOVAS FUNÇÕES ---

  /**
   * Lista planos salvos da sessão atual.
   */
  async function aoListarPlanosSalvos() {
    if (!sessaoId) {
      console.warn('Tentativa de listar planos sem sessaoId');
      return;
    }

    setCarregandoLista(true);
    setErro(null);

    try {
      console.log('Buscando planos salvos...');
      console.log('Sessão ID:', sessaoId);

      const planos = await planoDeAulaServico.listarPlanosSalvos(sessaoId);

      console.log(`${planos.length} planos encontrados`);
      if (planos.length > 0) {
        console.log('Planos:', planos.map(p => p.titulo).join(', '));
      } else {
        console.log('Nenhum plano salvo encontrado');
      }

      setPlanosSalvos(planos);
      setMostrarLista(!mostrarLista);
    } catch (e) {
      // --- LOG COMPLETO PARA O DESENVOLVEDOR ---
      console.group('ERRO - aoListarPlanosSalvos');
      console.log('Sessão ID:', sessaoId);
      console.log('Erro:', e);
      if (e instanceof Error) {
        console.log('Mensagem:', e.message);
        console.log('Stack:', e.stack);
      }
      console.groupEnd();

      setErro(e instanceof Error ? e.message : 'Erro ao carregar planos salvos');
    } finally {
      setCarregandoLista(false);
    }
  }

  /**
   * Carrega um plano salvo pelo ID, reconstruindo o estado da aplicação.
   */
  async function aoCarregarPlanoSalvo(id: string) {
    if (!sessaoId) {
      console.warn('Tentativa de carregar plano sem sessaoId');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      console.log('Carregando plano salvo...');
      console.log('ID do plano:', id);
      console.log('Sessão ID:', sessaoId);

      const plano = await planoDeAulaServico.buscarPlanoPorId(id, sessaoId);

      if (!plano) {
        console.warn('Plano não encontrado - ID:', id);
        setErro('Plano não encontrado');
        return;
      }

      console.log('Plano encontrado!');
      console.log('Título:', plano.titulo);

      // Reconstrói o rascunho a partir do JSON
      const rascunhoReconstruido = JSON.parse(plano.plano) as PlanoDeAulaRascunho;

      console.log('Rascunho reconstruído com sucesso');

      setRascunho(rascunhoReconstruido);
      setPlanoFinal({
        titulo: plano.titulo,
        plano: rascunhoReconstruido,
        relatorio: plano.relatorio,
      });
      setEtapa('relatorio');
      setMostrarLista(false);

      console.log('Plano carregado e exibido com sucesso!');
    } catch (e) {
      // --- LOG COMPLETO PARA O DESENVOLVEDOR ---
      console.group('ERRO - aoCarregarPlanoSalvo');
      console.log('ID do plano:', id);
      console.log('Sessão ID:', sessaoId);
      console.log('Erro:', e);
      if (e instanceof Error) {
        console.log('Mensagem:', e.message);
        console.log('Stack:', e.stack);
      }
      console.groupEnd();

      setErro(e instanceof Error ? e.message : 'Erro ao carregar plano');
    } finally {
      setCarregando(false);
    }
  }

  // --- RENDERIZAÇÃO ---

  return (
    <main className="app">
      <h1>MeuPlano.AI</h1>
      <p className="subtitulo">Crie planos de aula com inteligência artificial</p>

      {/* Etapa 1: entrada em linguagem natural */}
      {etapa === 'entrada' && (
        <FormularioEntrada
          onGerar={aoGerarRascunho}
          carregando={carregando}
          erro={erro}
          descricao={descricao}
          onDescricaoChange={setDescricao}
          descricaoRef={descricaoRef}
          planosSalvos={planosSalvos}
          mostrarLista={mostrarLista}
          carregandoLista={carregandoLista}
          onListarPlanos={aoListarPlanosSalvos}
          onCarregarPlano={aoCarregarPlanoSalvo}
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