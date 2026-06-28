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
 *
 * @param props Propriedades do componente.
 */
function FormularioEntrada({ onGerar, carregando, erro }: Props) {
  // Estado local com o texto digitado pelo professor.
  const [descricao, setDescricao] = useState('');

  // Lógica de validação no cliente (UX)
  const quantidadeCaracteres = descricao.trim().length;
  const descricaoInvalida = quantidadeCaracteres < 10;

  /**
   * Trata o envio do formulário, evitando o recarregamento da página e
   * repassando a descrição para o componente pai.
   */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    
    // Dupla checagem para evitar submissões indevidas
    if (!descricaoInvalida && !carregando) {
      onGerar(descricao);
    }
  }

  return (
    <form onSubmit={aoEnviar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2>Descreva sua aula</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label htmlFor="descricao" style={{ fontWeight: '600' }}>
          Descrição do plano de aula
        </label>
        
        <textarea
          id="descricao"
          rows={5}
          value={descricao}
          placeholder="Ex.: Quero uma aula de 50 minutos sobre introdução à engenharia de software para graduação."
          onChange={(evento) => setDescricao(evento.target.value)}
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        
        {/* Melhoria de UX: Contador de caracteres */}
        <div style={{ 
          textAlign: 'right', 
          fontSize: '0.85rem', 
          color: descricaoInvalida ? '#991b1b' : '#166534',
          fontWeight: '500'
        }}>
          {quantidadeCaracteres} / 10 caracteres mínimos
        </div>
      </div>

      {/* Melhoria de UX: Erros visíveis e amigáveis como Banner/Toast */}
      {erro && (
        <div 
          role="alert" 
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #f87171',
            fontWeight: '500'
          }}
        >
          <strong>Erro:</strong> {erro}
        </div>
      )}

      <button 
        type="submit" 
        disabled={carregando || descricaoInvalida}
        style={{
          opacity: (carregando || descricaoInvalida) ? 0.6 : 1,
          cursor: (carregando || descricaoInvalida) ? 'not-allowed' : 'pointer',
          padding: '0.75rem',
          borderRadius: '6px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {carregando ? 'Gerando...' : 'Gerar plano'}
      </button>
    </form>
  );
}

export default FormularioEntrada;
