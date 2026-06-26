// IndicadorEtapas.tsx: indicador visual das etapas do fluxo principal.
//
// Mostra ao professor em que ponto do processo ele está:
//   Entrada -> Revisão -> Relatório
//
// É um componente puramente visual: recebe a etapa atual e destaca o passo
// correspondente.

/**
 * Etapas possíveis do fluxo (mesmos valores usados no App).
 */
type Etapa = 'entrada' | 'formulario' | 'relatorio';

/**
 * Propriedades do indicador de etapas.
 */
type Props = {
  /**
   * Etapa atualmente ativa.
   */
  etapaAtual: Etapa;
};

/**
 * Lista ordenada das etapas, com a chave interna e o rótulo exibido.
 *
 * Manter a ordem aqui garante que o indicador siga a sequência do fluxo.
 */
const ETAPAS: Array<{ chave: Etapa; rotulo: string }> = [
  { chave: 'entrada', rotulo: 'Entrada' },
  { chave: 'formulario', rotulo: 'Revisão' },
  { chave: 'relatorio', rotulo: 'Relatório' },
];

/**
 * Renderiza a trilha de etapas, destacando a etapa atual e marcando as já
 * concluídas.
 *
 * @param props Propriedades do componente.
 */
function IndicadorEtapas({ etapaAtual }: Props) {
  // Posição (índice) da etapa atual na sequência, usada para decidir o que já
  // foi concluído.
  const indiceAtual = ETAPAS.findIndex((etapa) => etapa.chave === etapaAtual);

  return (
    // aria-label descreve a finalidade da navegação para leitores de tela.
    <nav className="indicador-etapas" aria-label="Progresso do plano de aula">
      <ol>
        {ETAPAS.map((etapa, indice) => {
          const ativa = indice === indiceAtual;
          const concluida = indice < indiceAtual;

          // Monta a lista de classes conforme o estado da etapa.
          const classes = [
            'indicador-etapas__item',
            ativa ? 'indicador-etapas__item--ativa' : '',
            concluida ? 'indicador-etapas__item--concluida' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <li
              key={etapa.chave}
              className={classes}
              // aria-current sinaliza ao leitor de tela qual é o passo atual.
              aria-current={ativa ? 'step' : undefined}
            >
              <span className="indicador-etapas__numero" aria-hidden="true">
                {indice + 1}
              </span>
              {etapa.rotulo}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default IndicadorEtapas;
