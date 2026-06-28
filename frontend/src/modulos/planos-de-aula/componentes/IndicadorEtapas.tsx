type Etapa = 'entrada' | 'formulario' | 'relatorio';

type Props = {
  etapaAtual: Etapa;
};

// A ordem desta lista é o que define o "antes e depois" do fluxo. Comparando o
// índice de cada etapa com o índice da etapa atual a gente descobre o que já foi
// concluído, o que está acontecendo agora e o que ainda falta - sem guardar isso
// em nenhum estado extra.
const ETAPAS: { id: Etapa; rotulo: string }[] = [
  { id: 'entrada', rotulo: 'Descrição' },
  { id: 'formulario', rotulo: 'Revisão' },
  { id: 'relatorio', rotulo: 'Relatório' },
];

function IndicadorEtapas({ etapaAtual }: Props) {
  const indiceAtual = ETAPAS.findIndex((e) => e.id === etapaAtual);

  return (
    <ol className="etapas" aria-label="Progresso do plano de aula">
      {ETAPAS.map((etapa, indice) => {
        // Etapa antes da atual = já concluída; a igual = ativa; depois = pendente.
        // Esse "estado" vira a classe CSS e também controla o aria-current lá embaixo.
        const concluida = indice < indiceAtual;
        const ativa = indice === indiceAtual;
        const estado = ativa ? 'ativa' : concluida ? 'concluida' : 'pendente';

        return (
          <li
            key={etapa.id}
            className={`etapa etapa--${estado}`}
            aria-current={ativa ? 'step' : undefined}
          >
            <span className="etapa__numero" aria-hidden="true">
              {concluida ? '✓' : indice + 1}
            </span>
            <span className="etapa__rotulo">{etapa.rotulo}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default IndicadorEtapas;
