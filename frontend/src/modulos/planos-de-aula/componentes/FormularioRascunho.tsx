// FormularioRascunho.tsx: segunda tela do fluxo principal.
//
// Passos 4 a 6 do caso de uso: o sistema exibe o rascunho com os campos
// preenchidos automaticamente; o professor revisa/edita e submete para gerar a
// versão final.

import { useState, type FormEvent } from 'react';

import type { PlanoDeAulaRascunho } from '../plano-de-aula.tipos';

/**
 * Propriedades do componente de revisão do rascunho.
 */
type Props = {
  /** Rascunho gerado pela IA, usado como valor inicial dos campos. */
  rascunhoInicial: PlanoDeAulaRascunho;

  /** Função chamada ao submeter, recebendo o rascunho (possivelmente editado). */
  onGerarFinal: (rascunho: PlanoDeAulaRascunho) => void;

  /** Função chamada ao pedir melhoria. */
  onMelhorar: (rascunho: PlanoDeAulaRascunho, orientacoes: string) => void;

  /** Indica que uma requisição está em andamento. */
  carregando: boolean;

  /** Mensagem de erro a ser exibida (ou null). */
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
  const [rascunho, setRascunho] = useState<PlanoDeAulaRascunho>(rascunhoInicial);
  const [orientacoes, setOrientacoes] = useState('');

  function atualizarTexto(campo: CampoTexto, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
  }

  function atualizarLista(campo: CampoLista, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor.split('\n') }));
  }

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    onGerarFinal(rascunho);
  }

  function aoMelhorar() {
    if (orientacoes.trim()) {
      onMelhorar(rascunho, orientacoes);
    }
  }

  const orientacoesValidas = orientacoes.trim().length > 0;

  return (
    <form onSubmit={aoEnviar}>
      <h2>Revise o rascunho</h2>

      <label htmlFor="titulo">Título</label>
      <input
        id="titulo"
        value={rascunho.titulo}
        onChange={(e) => atualizarTexto('titulo', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="disciplina">Disciplina</label>
      <input
        id="disciplina"
        value={rascunho.disciplina}
        onChange={(e) => atualizarTexto('disciplina', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="curso">Curso</label>
      <input
        id="curso"
        value={rascunho.curso}
        onChange={(e) => atualizarTexto('curso', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="nivel">Nível</label>
      <input
        id="nivel"
        value={rascunho.nivel}
        onChange={(e) => atualizarTexto('nivel', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="duracao">Duração</label>
      <input
        id="duracao"
        value={rascunho.duracao}
        onChange={(e) => atualizarTexto('duracao', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="tema">Tema</label>
      <input
        id="tema"
        value={rascunho.tema}
        onChange={(e) => atualizarTexto('tema', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="objetivos">Objetivos (um por linha)</label>
      <textarea
        id="objetivos"
        rows={3}
        value={rascunho.objetivos.join('\n')}
        onChange={(e) => atualizarLista('objetivos', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="conteudos">Conteúdos (um por linha)</label>
      <textarea
        id="conteudos"
        rows={3}
        value={rascunho.conteudos.join('\n')}
        onChange={(e) => atualizarLista('conteudos', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="metodologia">Metodologia</label>
      <textarea
        id="metodologia"
        rows={2}
        value={rascunho.metodologia}
        onChange={(e) => atualizarTexto('metodologia', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="recursos">Recursos (um por linha)</label>
      <textarea
        id="recursos"
        rows={3}
        value={rascunho.recursos.join('\n')}
        onChange={(e) => atualizarLista('recursos', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="avaliacao">Avaliação</label>
      <textarea
        id="avaliacao"
        rows={2}
        value={rascunho.avaliacao}
        onChange={(e) => atualizarTexto('avaliacao', e.target.value)}
        disabled={carregando}
      />

      <label htmlFor="orientacoes">
        Orientações para melhorar o plano (opcional)
      </label>
      <textarea
        id="orientacoes"
        rows={2}
        value={orientacoes}
        placeholder="Ex.: Deixe a metodologia mais ativa e inclua uma atividade em grupo."
        onChange={(e) => setOrientacoes(e.target.value)}
        disabled={carregando}
      />

      {erro && <p className="erro-mensagem" role="alert">{erro}</p>}

      <div className="acoes">
        <button
          type="button"
          onClick={aoMelhorar}
          disabled={!orientacoesValidas || carregando}
        >
          {carregando ? (
            <>
              <span className="spinner"></span>
              Processando...
            </>
          ) : (
            'Melhorar plano'
          )}
        </button>

        <button
          type="submit"
          className="btn-principal"
          disabled={carregando}
        >
          {carregando ? (
            <>
              <span className="spinner"></span>
              Processando...
            </>
          ) : (
            'Gerar versão final'
          )}
        </button>
      </div>
    </form>
  );
}

export default FormularioRascunho;