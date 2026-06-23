// FormularioEntrada.tsx: primeira tela do fluxo principal.
//
// Passos 1 a 3 do caso de uso: o professor descreve, em linguagem natural, o
// plano de aula desejado e submete para gerar o rascunho.

import { type FormEvent, type RefObject } from 'react';
import type { PlanoSalvo } from '../plano-de-aula.tipos';

/**
 * Propriedades do componente de entrada.
 */
type Props = {
  /** Função chamada ao submeter o formulário. */
  onGerar: (descricao: string) => void;

  /** Indica que uma requisição está em andamento. */
  carregando: boolean;

  /** Mensagem de erro a ser exibida (ou null). */
  erro: string | null;

  // --- NOVAS PROPS ---
  /** Valor atual da descrição */
  descricao: string;
  /** Função para atualizar a descrição */
  onDescricaoChange: (valor: string) => void;
  /** Referência para o campo de texto (foco) */
  descricaoRef: RefObject<HTMLTextAreaElement>;
  /** Lista de planos salvos */
  planosSalvos: PlanoSalvo[];
  /** Controla visibilidade da lista */
  mostrarLista: boolean;
  /** Indica carregamento da lista */
  carregandoLista: boolean;
  /** Função para listar planos */
  onListarPlanos: () => void;
  /** Função para carregar um plano específico */
  onCarregarPlano: (id: string) => void;
};

/**
 * Tela inicial: campo de texto livre + botão para gerar o rascunho.
 */
function FormularioEntrada({
  onGerar,
  carregando,
  erro,
  descricao,
  onDescricaoChange,
  descricaoRef,
  planosSalvos,
  mostrarLista,
  carregandoLista,
  onListarPlanos,
  onCarregarPlano,
}: Props) {
  // Validação: mínimo 10 caracteres
  const descricaoValida = descricao.trim().length >= 10;

  /**
   * Trata o envio do formulário.
   */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (descricaoValida && !carregando) {
      onGerar(descricao);
    }
  }

  return (
    <>
      <form onSubmit={aoEnviar}>
        <h2>Descreva sua aula</h2>

        <div className="campo-header">
          <label htmlFor="descricao">Descrição do plano de aula</label>
          <span className="contador-caracteres">
            {descricao.length}/10 caracteres mínimos
          </span>
        </div>

        <textarea
          id="descricao"
          ref={descricaoRef}
          rows={4}
          value={descricao}
          placeholder="Ex.: Quero uma aula de 50 minutos sobre introdução à engenharia de software para graduação."
          onChange={(evento) => onDescricaoChange(evento.target.value)}
          disabled={carregando}
          aria-describedby={erro ? 'erro-descricao' : undefined}
        />

        {erro && (
          <div className="erro-banner" role="alert">
            
              <p className="erro-mensagem">{erro}</p>
              {erro.includes('temporariamente') && (
                <p className="erro-dica">Dica: Espere alguns minutos e tente novamente.</p>
              )}
              {erro.includes('limite') && (
                <p className="erro-dica">O limite de uso é renovado diariamente.</p>
              )}
              {erro.includes('conexão') && (
                <p className="erro-dica">Verifique sua internet e recarregue a página.</p>
              )}
            
          </div>
        )}

        <button
          type="submit"
          className="btn-principal"
          disabled={!descricaoValida || carregando}
        >
          {carregando ? (
            <>
              <span className="spinner"></span>
              Gerando...
            </>
          ) : (
            'Gerar plano'
          )}
        </button>
      </form>

      {/* SEÇÃO DE PLANOS SALVOS (Melhorias 1 e 2)*/}
      <div className="planos-salvos-section">
        <button
          type="button"
          className="btn-secundario"
          onClick={onListarPlanos}
          disabled={carregandoLista}
        >
          {carregandoLista ? (
            <span className="spinner-pequeno"></span>
          ) : (
            'Ver planos salvos'
          )}
        </button>

        {mostrarLista && (
          <div className="lista-planos">
            <h3>Planos anteriores</h3>
            {planosSalvos.length === 0 ? (
              <p className="lista-vazia">Nenhum plano salvo ainda</p>
            ) : (
              <ul>
                {planosSalvos.map((plano) => (
                  <li key={plano._id}>
                    <button
                      type="button"
                      className="item-plano"
                      onClick={() => onCarregarPlano(plano._id)}
                      disabled={carregando}
                    >
                      <span className="item-titulo">{plano.titulo}</span>
                      <span className="item-data">
                        {new Date(plano.criadoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default FormularioEntrada;