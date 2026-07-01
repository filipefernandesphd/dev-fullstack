// FormularioEntrada.tsx: primeira tela do fluxo principal.
//
// Passos 1 a 3 do caso de uso: o professor descreve, em linguagem natural, o
// plano de aula desejado e submete para gerar o rascunho.

import { useState, type FormEvent } from 'react';

type Props = {
  onGerar: (descricao: string) => void;
  carregando: boolean;
  erro: string | null;
};

function FormularioEntrada({ onGerar, carregando, erro }: Props) {
  const [descricao, setDescricao] = useState('');

  const descricaoTrim = descricao.trim();
  const descricaoValida = descricaoTrim.length >= 10;

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    // UX: bloqueio extra de segurança (não substitui backend)
    if (!descricaoValida || carregando) return;

    onGerar(descricaoTrim);
  }

  return (
    <form onSubmit={aoEnviar}>
      <h2>Descreva sua aula</h2>

      {/* UX: indicador de etapa */}
      <p className="etapas">
        Etapa 1 de 3: Descrição do plano de aula
      </p>

      <label htmlFor="descricao">Descrição do plano de aula</label>

      <textarea
        id="descricao"
        rows={4}
        value={descricao}
        placeholder="Ex.: Quero uma aula de 50 minutos sobre introdução à engenharia de software para graduação."
        onChange={(e) => setDescricao(e.target.value)}
        aria-invalid={!descricaoValida && descricaoTrim.length > 0}
      />

      {/* UX: validação antecipada (cliente) */}
      {descricaoTrim.length > 0 && !descricaoValida && (
        <p role="alert" style={{ color: 'orange' }}>
          A descrição deve ter pelo menos 10 caracteres.
        </p>
      )}

      {/* Erro da API */}
      {erro && (
        <p role="alert" style={{ color: 'red' }}>
          {erro}
        </p>
      )}

      <button type="submit" disabled={!descricaoValida || carregando}>
        {carregando ? 'Gerando plano...' : 'Gerar plano'}
      </button>
    </form>
  );
}

export default FormularioEntrada;