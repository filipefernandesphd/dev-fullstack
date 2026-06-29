type Props = {
  etapaAtual: 'entrada' | 'formulario' | 'relatorio';
};

const etapas = [
  {
    id: 'entrada',
    nome: 'Entrada',
  },
  {
    id: 'formulario',
    nome: 'Revisão',
  },
  {
    id: 'relatorio',
    nome: 'Relatório',
  },
];

function IndicadorEtapas({ etapaAtual }: Props) {
  const indiceAtual = etapas.findIndex(
    (etapa) => etapa.id === etapaAtual,
  );

  return (
    <nav className="indicador-etapas" aria-label="Etapas do plano de aula">
      {etapas.map((etapa, indice) => (
        <div
          key={etapa.id}
          className={
            indice === indiceAtual
              ? 'etapa ativa'
              : indice < indiceAtual
                ? 'etapa concluida'
                : 'etapa'
          }
        >
          <span>{indice < indiceAtual ? '✓' : indice + 1}</span>
          <p>{etapa.nome}</p>
        </div>
      ))}
    </nav>
  );
}

export default IndicadorEtapas;