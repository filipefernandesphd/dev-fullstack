// FormularioRascunho.tsx: segunda tela do fluxo principal.
//
// Passos 4 a 6 do caso de uso: o sistema exibe o rascunho com os campos
// preenchidos automaticamente; o professor revisa/edita e submete para gerar a
// versão final.

import { useState, useEffect, type FormEvent } from 'react';

import type { PlanoDeAulaRascunho } from '../plano-de-aula.tipos';

/**
 * Propriedades do componente de revisão do rascunho.
 */
type Props = {
  /**
   * Rascunho gerado pela IA, usado como valor inicial dos campos.
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
 *
 * @param props Propriedades do componente.
 */
function FormularioRascunho({
  rascunhoInicial,
  onGerarFinal,
  onMelhorar,
  carregando,
  erro,
}: Props) {
  // Estado local com uma cópia editável do rascunho recebido.
  const [rascunho, setRascunho] = useState<PlanoDeAulaRascunho>(rascunhoInicial);

  // Sincroniza o estado local quando o rascunho inicial mudar (ex.: após melhoria pela IA).
  useEffect(() => {
    setRascunho(rascunhoInicial);
  }, [rascunhoInicial]);

  // Orientações adicionais que o professor pode informar para melhorar o plano.
  const [orientacoes, setOrientacoes] = useState('');

  /**
   * Atualiza um campo de texto simples do rascunho.
   */
  function atualizarTexto(campo: CampoTexto, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
  }

  /**
   * Atualiza um campo de lista. No formulário, cada item fica em uma linha;
   * por isso convertemos o texto em array quebrando por quebras de linha.
   */
  function atualizarLista(campo: CampoLista, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor.split('\n') }));
  }

  /**
   * Trata o envio: evita o recarregamento e repassa o rascunho revisado.
   */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    onGerarFinal(rascunho);
  }

  /**
   * Pede a melhoria do rascunho atual usando as orientações informadas.
   *
   * É um botão do tipo "button" (não "submit") para não disparar o envio do
   * formulário (que gera a versão final).
   */
  function aoMelhorar() {
    onMelhorar(rascunho, orientacoes);
  }

  return (
    <form onSubmit={aoEnviar} className="formulario-card">
      <h2>Revise o rascunho</h2>

      <div className="campo-grupo">
        <label htmlFor="titulo">Título</label>
        <input
          id="titulo"
          value={rascunho.titulo}
          onChange={(e) => atualizarTexto('titulo', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="disciplina">Disciplina</label>
        <input
          id="disciplina"
          value={rascunho.disciplina}
          onChange={(e) => atualizarTexto('disciplina', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="curso">Curso</label>
        <input
          id="curso"
          value={rascunho.curso}
          onChange={(e) => atualizarTexto('curso', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="nivel">Nível</label>
        <input
          id="nivel"
          value={rascunho.nivel}
          onChange={(e) => atualizarTexto('nivel', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="duracao">Duração</label>
        <input
          id="duracao"
          value={rascunho.duracao}
          onChange={(e) => atualizarTexto('duracao', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="tema">Tema</label>
        <input
          id="tema"
          value={rascunho.tema}
          onChange={(e) => atualizarTexto('tema', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="objetivos">Objetivos (um por linha)</label>
        <textarea
          id="objetivos"
          rows={3}
          value={rascunho.objetivos.join('\n')}
          onChange={(e) => atualizarLista('objetivos', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="conteudos">Conteúdos (um por linha)</label>
        <textarea
          id="conteudos"
          rows={3}
          value={rascunho.conteudos.join('\n')}
          onChange={(e) => atualizarLista('conteudos', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="metodologia">Metodologia</label>
        <textarea
          id="metodologia"
          rows={2}
          value={rascunho.metodologia}
          onChange={(e) => atualizarTexto('metodologia', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="recursos">Recursos (um por linha)</label>
        <textarea
          id="recursos"
          rows={3}
          value={rascunho.recursos.join('\n')}
          onChange={(e) => atualizarLista('recursos', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="avaliacao">Avaliação</label>
        <textarea
          id="avaliacao"
          rows={2}
          value={rascunho.avaliacao}
          onChange={(e) => atualizarTexto('avaliacao', e.target.value)}
        />
      </div>

      <div className="campo-grupo">
        <label htmlFor="orientacoes">
          Orientações para melhorar o plano (opcional)
        </label>
        <textarea
          id="orientacoes"
          rows={2}
          value={orientacoes}
          placeholder="Ex.: Deixe a metodologia mais ativa e inclua uma atividade em grupo."
          onChange={(e) => setOrientacoes(e.target.value)}
        />
      </div>

      {erro && <p role="alert" className="erro-banner">{erro}</p>}

      {/*
        Dois botões:
        - "Melhorar plano" (type="button"): pede à IA um novo rascunho com base
          nas orientações, permanecendo nesta tela de revisão;
        - "Gerar versão final" (type="submit"): avança para o relatório final.
      */}
      <div className="acoes">
        <button
          type="button"
          onClick={aoMelhorar}
          disabled={carregando}
          className={carregando ? 'botao-carregando' : ''}
        >
          {carregando ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Processando...
            </>
          ) : (
            'Melhorar plano'
          )}
        </button>

        <button
          type="submit"
          disabled={carregando}
          className={carregando ? 'botao-carregando' : ''}
        >
          {carregando ? (
            <>
              <span className="spinner" aria-hidden="true" />
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
