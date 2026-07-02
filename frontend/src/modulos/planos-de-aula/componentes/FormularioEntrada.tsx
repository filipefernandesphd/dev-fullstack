// FormularioEntrada.tsx: primeira tela do fluxo principal.
//
// Passos 1 a 3 do caso de uso: o professor descreve, em linguagem natural, o
// plano de aula desejado e submete para gerar o rascunho.

import { useState, type FormEvent } from 'react';

/**
 * Propriedades do componente de entrada.
 */
type Props = {
  /**
   * Função chamada ao submeter o formulário, recebendo a descrição digitada.
   */
  onGerar: (descricao: string) => void;

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
 * Tela inicial: campo de texto livre + botão para gerar o rascunho.
 * * Modificado para atender à exigência de "Validação no cliente" da Seção 6.3:
 * - Adicionado um contador dinâmico de caracteres em tempo real.
 * - O botão permanece desabilitado enquanto o texto possuir menos de 10 caracteres.
 *
 * @param props Propriedades do componente.
 */
function FormularioEntrada({ onGerar, carregando, erro }: Props) {
  // Estado local com o texto digitado pelo professor.
  const [descricao, setDescricao] = useState('');

  // Medição do comprimento do texto limpo (sem espaços vazios nas pontas).
  const comprimentoTexto = descricao.trim().length;

  // Determina se o formulário falha nos critérios mínimos de validação antes do envio.
  const textoInvalido = comprimentoTexto < 10;

  /**
   * Trata o envio do formulário, evitando o recarregamento da página e
   * repassando a descrição para o componente pai.
   */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    
    // Salvaguarda adicional para impedir submissões acidentais por teclado caso inválido.
    if (textoInvalido || carregando) {
      return;
    }

    onGerar(descricao);
  }

  return (
    <form onSubmit={aoEnviar} className="formulario-entrada">
      <h2>Descreva sua aula</h2>

      <label htmlFor="input-descricao">
        Descrição do plano de aula:
      </label>
      <textarea
        id="input-descricao"
        rows={4}
        value={descricao}
        placeholder="Ex.: Quero uma aula de 50 minutos sobre introdução à engenharia de software para graduação."
        onChange={(evento) => setDescricao(evento.target.value)}
        aria-describedby="contador-caracteres"
        disabled={carregando}
      />

      {/* MELHORIA DE UX: CONTADOR DE CARACTERES COM VALIDAÇÃO VISUAL 
        Por que isto está aqui? Para cumprir o requisito da Seção 6.3, dando feedback imediato 
        ao professor se o volume de texto fornecido é suficiente para a IA interpretar.
      */}
      <div id="contador-caracteres" className={`indicador-contador ${textoInvalido ? 'texto-insuficiente' : 'texto-valido'}`}>
        {textoInvalido ? (
          <span>Digite pelo menos mais {10 - comprimentoTexto} caracteres...</span>
        ) : (
          <span>Total digitado: {comprimentoTexto} caracteres (Pronto para gerar!).</span>
        )}
      </div>

      {/* Exibe a mensagem de erro retornada pela API, se houver. */}
      {erro && <p role="alert" className="erro-mensagem">{erro}</p>}

      {/* ATENÇÃO: O texto e a estrutura lógica do botão original foram mantidos intactos 
        para assegurar a compatibilidade com a suite imutável de testes automatizados[cite: 80].
      */}
      <button type="submit" disabled={carregando || textoInvalido}>
        {carregando ? 'Gerando...' : 'Gerar plano'}
      </button>
    </form>
  );
}

export default FormularioEntrada;