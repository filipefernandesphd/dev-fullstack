// FormularioRascunho.tsx: segunda tela do fluxo principal.
//
// Passos 4 a 6 do caso de uso: o sistema exibe o rascunho com os campos
// preenchidos automaticamente; o professor revisa/edita e submete para gerar a
// versão final.
//
// IMPORTANTE (REGRA DE ARQUITETURA):
// Este componente NÃO deve conter regras de negócio. Ele apenas manipula estado
// local de UI e delega ações para a camada superior.

import { useState, type FormEvent } from 'react';

import type { PlanoDeAulaRascunho } from '../plano-de-aula.tipos';

/**
 * Propriedades do componente de revisão do rascunho.
 */
type Props = {
  /**
   * Rascunho gerado pela IA, usado como valor inicial dos campos.
   *
   * POR QUÊ:
   * Permite edição incremental sem perder o conteúdo gerado automaticamente.
   */
  rascunhoInicial: PlanoDeAulaRascunho;

  /**
   * Função chamada ao submeter, recebendo o rascunho (possivelmente editado).
   */
  onGerarFinal: (rascunho: PlanoDeAulaRascunho) => void;

  /**
   * Função chamada ao pedir melhoria, recebendo o rascunho atual e as
   * orientações adicionais do professor.
   */
  onMelhorar: (rascunho: PlanoDeAulaRascunho, orientacoes: string) => void;

  /**
   * Indica que uma requisição está em andamento (desabilita o botão).
   *
   * POR QUÊ:
   * Evita múltiplos disparos simultâneos que poderiam gerar estados inconsistentes.
   */
  carregando: boolean;

  /**
   * Mensagem de erro a ser exibida (ou null quando não há erro).
   */
  erro: string | null;
};

/**
 * Nomes dos campos de TEXTO simples do rascunho (string).
 */
type CampoTexto =
  | 'titulo'
  | 'disciplina'
  | 'curso'
  | 'nivel'
  | 'duracao'
  | 'tema'
  | 'metodologia'
  | 'avaliacao';

/**
 * Nomes dos campos de LISTA do rascunho (string[]).
 */
type CampoLista = 'objetivos' | 'conteudos' | 'recursos';

/**
 * Formulário editável do rascunho do plano de aula.
 */
function FormularioRascunho({
  rascunhoInicial,
  onGerarFinal,
  onMelhorar,
  carregando,
  erro,
}: Props) {
  /**
   * Estado local com cópia editável do rascunho.
   *
   * POR QUÊ:
   * Evita mutação direta das props e garante isolamento de estado da UI.
   */
  const [rascunho, setRascunho] = useState<PlanoDeAulaRascunho>(rascunhoInicial);

  /**
   * Orientações adicionais para melhoria do plano.
   */
  const [orientacoes, setOrientacoes] = useState('');

  /**
   * Atualiza um campo de texto simples do rascunho.
   */
  function atualizarTexto(campo: CampoTexto, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
  }

  /**
   * Atualiza campos de lista convertendo linhas em array.
   *
   * POR QUÊ:
   * Facilita edição humana (uma linha por item) sem mudar estrutura interna.
   */
  function atualizarLista(campo: CampoLista, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor.split('\n') }));
  }

  /**
   * Trata o envio do formulário para geração da versão final.
   */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    onGerarFinal(rascunho);
  }

  /**
   * Solicita melhoria do rascunho com base nas orientações do usuário.
   */
  function aoMelhorar() {
    onMelhorar(rascunho, orientacoes);
  }

  /**
   * UX: evita submissão com campos vazios críticos.
   * (sem alterar regra de negócio, apenas prevenção de UX ruim)
   */
  const podeEnviar = rascunho.titulo?.trim()?.length > 0;

  return (
    <form onSubmit={aoEnviar}>
      <h2>Revise o rascunho</h2>

      {/* ALERTA ACESSÍVEL DE ERRO */}
      {erro && (
        <p role="alert" aria-live="assertive">
          {erro}
        </p>
      )}

      <label htmlFor="titulo">Título</label>
      <input
        id="titulo"
        value={rascunho.titulo}
        onChange={(e) => atualizarTexto('titulo', e.target.value)}
      />

      <label htmlFor="disciplina">Disciplina</label>
      <input
        id="disciplina"
        value={rascunho.disciplina}
        onChange={(e) => atualizarTexto('disciplina', e.target.value)}
      />

      <label htmlFor="curso">Curso</label>
      <input
        id="curso"
        value={rascunho.curso}
        onChange={(e) => atualizarTexto('curso', e.target.value)}
      />

      <label htmlFor="nivel">Nível</label>
      <input
        id="nivel"
        value={rascunho.nivel}
        onChange={(e) => atualizarTexto('nivel', e.target.value)}
      />

      <label htmlFor="duracao">Duração</label>
      <input
        id="duracao"
        value={rascunho.duracao}
        onChange={(e) => atualizarTexto('duracao', e.target.value)}
      />

      <label htmlFor="tema">Tema</label>
      <input
        id="tema"
        value={rascunho.tema}
        onChange={(e) => atualizarTexto('tema', e.target.value)}
      />

      {/* LISTAS: UX MAIS CLARA */}
      <label htmlFor="objetivos">Objetivos (um por linha)</label>
      <textarea
        id="objetivos"
        rows={3}
        value={rascunho.objetivos.join('\n')}
        onChange={(e) => atualizarLista('objetivos', e.target.value)}
      />

      <label htmlFor="conteudos">Conteúdos (um por linha)</label>
      <textarea
        id="conteudos"
        rows={3}
        value={rascunho.conteudos.join('\n')}
        onChange={(e) => atualizarLista('conteudos', e.target.value)}
      />

      <label htmlFor="metodologia">Metodologia</label>
      <textarea
        id="metodologia"
        rows={2}
        value={rascunho.metodologia}
        onChange={(e) => atualizarTexto('metodologia', e.target.value)}
      />

      <label htmlFor="recursos">Recursos (um por linha)</label>
      <textarea
        id="recursos"
        rows={3}
        value={rascunho.recursos.join('\n')}
        onChange={(e) => atualizarLista('recursos', e.target.value)}
      />

      <label htmlFor="avaliacao">Avaliação</label>
      <textarea
        id="avaliacao"
        rows={2}
        value={rascunho.avaliacao}
        onChange={(e) => atualizarTexto('avaliacao', e.target.value)}
      />

      <label htmlFor="orientacoes">
        Orientações para melhorar o plano (opcional)
      </label>
      <textarea
        id="orientacoes"
        rows={2}
        value={orientacoes}
        placeholder="Ex.: Deixe a metodologia mais ativa e inclua atividade em grupo."
        onChange={(e) => setOrientacoes(e.target.value)}
      />

      <div className="acoes">
        <button
          type="button"
          onClick={aoMelhorar}
          disabled={carregando}
          aria-busy={carregando}
        >
          {carregando ? 'Processando...' : 'Melhorar plano'}
        </button>

        <button
          type="submit"
          disabled={carregando || !podeEnviar}
          aria-busy={carregando}
        >
          {carregando ? 'Processando...' : 'Gerar versão final'}
        </button>
      </div>
    </form>
  );
}

export default FormularioRascunho;