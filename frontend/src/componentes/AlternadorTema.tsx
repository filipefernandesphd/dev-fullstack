// AlternadorTema.tsx: botão que alterna entre os temas claro e escuro.
//
// Funcionamento:
//   - O tema ativo é representado pelo atributo data-tema no <html>.
//   - Na primeira carga segue a preferência salva pelo usuário; se não houver,
//     usa-se a preferência do sistema operacional (prefers-color-scheme).
//   - Para evitar o "flash" de tema errado antes do React montar, o tema inicial
//     também é aplicado por um pequeno script em index.html. Este componente
//     apenas mantém o atributo e o localStorage sincronizados com o estado.

import { useEffect, useState } from 'react';

type Tema = 'claro' | 'escuro';

// Chave usada no localStorage para lembrar a escolha do usuário.
const CHAVE_TEMA = 'tema';

/**
 * Indica se o sistema operacional prefere o tema escuro.
 *
 * Feito de forma defensiva: em ambientes sem matchMedia
 * simplesmente assume tema claro, sem quebrar.
 */
function sistemaPrefereEscuro(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/**
 * Determina o tema inicial: escolha salva > preferência do sistema > claro.
 */
function lerTemaInicial(): Tema {
  const salvo =
    typeof localStorage !== 'undefined' ? localStorage.getItem(CHAVE_TEMA) : null;

  if (salvo === 'claro' || salvo === 'escuro') {
    return salvo;
  }

  return sistemaPrefereEscuro() ? 'escuro' : 'claro';
}

/**
 * Botão de alternância de tema, exibido no canto superior da aplicação.
 */
export default function AlternadorTema() {
  const [tema, setTema] = useState<Tema>(lerTemaInicial);

  // Sempre que o tema muda, reflete no <html> e persiste a escolha.
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      // localStorage indisponível (ex.: modo privado): ignoramos silenciosamente.
    }
  }, [tema]);

  const escuro = tema === 'escuro';

  return (
    <button
      type="button"
      className="tema-toggle"
      onClick={() => setTema(escuro ? 'claro' : 'escuro')}
      aria-pressed={escuro}
      title={escuro ? 'Usar tema claro' : 'Usar tema escuro'}
    >
      <span aria-hidden="true">{escuro ? '☀️' : '🌙'}</span>
      <span className="sr-only">
        {escuro ? 'Ativar tema claro' : 'Ativar tema escuro'}
      </span>
    </button>
  );
}
