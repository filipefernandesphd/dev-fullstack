import type { PlanoDeAulaRascunho } from "./plano-de-aula.tipos";

/**
 * Converte um objeto JavaScript para uma string JSON formatada.
 *
 * Essa função ajuda a enviar o rascunho atual para a IA de forma legível
 * e estruturada dentro do prompt.
 *
 * @param valor Objeto que será convertido para JSON.
 * @returns String JSON formatada com indentação.
 */
function formatarJson(valor: unknown): string {
    return JSON.stringify(valor, null, 2);
}

/**
 * Cria o prompt usado para gerar o primeiro rascunho do plano de aula.
 *
 * Esse prompt será usado no endpoint:
 *
 * POST /planos-de-aula/rascunho
 *
 * @param descricao Descrição em linguagem natural enviada pelo professor.
 * @returns Prompt textual a ser enviado para o serviço de IA.
 */
export function criarPromptGerarRascunho(descricao: string): string {
    return `
Você é um assistente pedagógico especializado em planejamento de aulas.

Sua tarefa é transformar a descrição livre do professor em um rascunho estruturado de plano de aula.

IMPORTANTE:
- Gere o planejamento de SOMENTE UMA AULA.
- Não gere uma sequência de aulas.
- Não gere um plano de disciplina.
- Não gere um plano de curso.
- Não gere um cronograma com várias semanas ou vários encontros.
- Não divida o conteúdo em "Aula 1", "Aula 2", "Aula 3" etc.
- Se a descrição do professor for ampla, selecione apenas um recorte introdutório adequado para uma única aula.
- Se a duração não for informada pelo professor, assuma uma aula de 50 minutos.
- Todos os objetivos, conteúdos, metodologia, recursos e avaliação devem caber em uma única aula.

Descrição do professor:
"${descricao}"

Retorne exclusivamente um JSON válido, sem Markdown, sem comentários e sem texto adicional.

O JSON deve seguir exatamente esta estrutura:

{
  "titulo": "string",
  "disciplina": "string",
  "curso": "string",
  "nivel": "string",
  "duracao": "string",
  "tema": "string",
  "objetivos": ["string"],
  "conteudos": ["string"],
  "metodologia": "string",
  "recursos": ["string"],
  "avaliacao": "string"
}

Siga o exemplo abaixo de reposta à descrição do professor que pediu "preparar uma aula sobre introdução à engenharia de software para graduação":

{
  "titulo": "Introdução à Engenharia de Software",
  "disciplina": "Engenharia de Software",
  "curso": "Graduação em Computação",
  "nivel": "Iniciante",
  "duracao": "50 minutos",
  "tema": "Conceitos iniciais de Engenharia de Software",
  "objetivos": [
    "Compreender o conceito de Engenharia de Software.",
    "Diferenciar desenvolvimento de software ad hoc de processos sistemáticos.",
    "Identificar a importância da qualidade no desenvolvimento de software."
  ],
  "conteudos": [
    "Definição de Engenharia de Software",
    "Diferença entre programação e Engenharia de Software",
    "Noções de processo de software",
    "Importância da qualidade, manutenção e requisitos"
  ],
  "metodologia": "Aula expositiva dialogada com exemplos de sistemas reais e breve discussão orientada sobre problemas comuns em projetos de software.",
  "recursos": [
    "Projetor",
    "Computador",
    "Slides",
    "Quadro"
  ],
  "avaliacao": "Participação dos estudantes na discussão e resposta individual a uma pergunta reflexiva ao final da aula."
}


Regras para o preenchimento:
- "titulo" deve representar uma única aula.
- "duracao" deve indicar a duração de uma única aula.
- "tema" deve ser específico o suficiente para ser trabalhado em uma única aula.
- "objetivos" deve conter de 2 a 4 objetivos alcançáveis em uma única aula. Cada objetivo deve ser uma string e NÃO uma estrutura de objetos.
- "conteudos" deve conter de 2 a 5 tópicos adequados para uma única aula. Cada conteudo deve ser uma string e NÃO uma estrutura de objetos.
- "metodologia" deve descrever apenas as estratégias usadas nesta aula. Cada metodologia deve ser uma string e NÃO uma estrutura de objetos.
- "avaliacao" deve descrever uma forma simples de avaliação aplicável nesta aula.
`.trim();
}

/**
 * Cria o prompt usado para melhorar um rascunho de plano de aula existente.
 *
 * Esse prompt será usado no endpoint:
 *
 * POST /planos-de-aula/rascunho/melhorar
 *
 * @param rascunhoAtual Rascunho atual do plano de aula.
 * @param instrucoes Novas instruções enviadas pelo professor.
 * @returns Prompt textual a ser enviado para o serviço de IA.
 */
export function criarPromptMelhorarRascunho(
  rascunhoAtual: PlanoDeAulaRascunho,
  instrucoes: string,
): string {
  return `
Você é um assistente pedagógico especializado em planejamento de aulas.

Sua tarefa é melhorar o rascunho de plano de aula abaixo considerando as novas instruções do professor.

IMPORTANTE:
- Mantenha o planejamento limitado a SOMENTE UMA AULA.
- Não transforme o rascunho em sequência de aulas.
- Não crie plano de disciplina, plano de curso ou cronograma.
- Não divida o conteúdo em "Aula 1", "Aula 2", "Aula 3" etc.
- Se as instruções forem amplas, aplique apenas ajustes compatíveis com uma única aula.
- Todos os objetivos, conteúdos, metodologia, recursos e avaliação devem continuar cabendo em uma única aula.

Rascunho atual:
${formatarJson(rascunhoAtual)}

Novas instruções do professor:
"${instrucoes}"

Retorne exclusivamente um JSON válido, sem Markdown, sem comentários e sem texto adicional.

O JSON deve seguir exatamente esta estrutura:

{
  "titulo": "string",
  "disciplina": "string",
  "curso": "string",
  "nivel": "string",
  "duracao": "string",
  "tema": "string",
  "objetivos": ["string"],
  "conteudos": ["string"],
  "metodologia": "string",
  "recursos": ["string"],
  "avaliacao": "string"
}

Siga o exemplo abaixo de reposta à descrição do professor que pediu "preparar uma aula sobre introdução à engenharia de software para graduação":

{
  "titulo": "Introdução à Engenharia de Software",
  "disciplina": "Engenharia de Software",
  "curso": "Graduação em Computação",
  "nivel": "Iniciante",
  "duracao": "50 minutos",
  "tema": "Conceitos iniciais de Engenharia de Software",
  "objetivos": [
    "Compreender o conceito de Engenharia de Software.",
    "Diferenciar desenvolvimento de software ad hoc de processos sistemáticos.",
    "Identificar a importância da qualidade no desenvolvimento de software."
  ],
  "conteudos": [
    "Definição de Engenharia de Software",
    "Diferença entre programação e Engenharia de Software",
    "Noções de processo de software",
    "Importância da qualidade, manutenção e requisitos"
  ],
  "metodologia": "Aula expositiva dialogada com exemplos de sistemas reais e breve discussão orientada sobre problemas comuns em projetos de software.",
  "recursos": [
    "Projetor",
    "Computador",
    "Slides",
    "Quadro"
  ],
  "avaliacao": "Participação dos estudantes na discussão e resposta individual a uma pergunta reflexiva ao final da aula."
}

Regras para o preenchimento:
- "titulo" deve representar uma única aula.
- "duracao" deve indicar a duração de uma única aula.
- "tema" deve ser específico o suficiente para ser trabalhado em uma única aula.
- "objetivos" deve conter de 2 a 4 objetivos alcançáveis em uma única aula. Cada objetivo deve ser uma string e NÃO uma estrutura de objetos.
- "conteudos" deve conter de 2 a 5 tópicos adequados para uma única aula. Cada conteudo deve ser uma string e NÃO uma estrutura de objetos.
- "metodologia" deve descrever apenas as estratégias usadas nesta aula. Cada metodologia deve ser uma string e NÃO uma estrutura de objetos.
- "avaliacao" deve descrever uma forma simples de avaliação aplicável nesta aula.
`.trim();
}

/**
 * Cria o prompt usado para gerar a versão final do plano de aula.
 *
 * Esse prompt será usado no endpoint:
 *
 * POST /planos-de-aula/final
 *
 * @param rascunhoRevisado Rascunho revisado pelo professor.
 * @returns Prompt textual a ser enviado para o serviço de IA.
 */
export function criarPromptGerarPlanoFinal(
  rascunhoRevisado: PlanoDeAulaRascunho,
): string {
  return `
Você é um assistente pedagógico especializado em planejamento de aulas.

Sua tarefa é transformar o rascunho revisado abaixo em um plano de aula final em formato de relatório.

IMPORTANTE:
- O relatório final deve representar SOMENTE UMA AULA.
- Não gere sequência de aulas.
- Não gere plano de disciplina.
- Não gere plano de curso.
- Não gere cronograma de várias semanas ou vários encontros.
- Não divida o relatório em "Aula 1", "Aula 2", "Aula 3" etc.
- Todo o planejamento deve caber na duração indicada no rascunho.

Rascunho revisado:
${formatarJson(rascunhoRevisado)}

Retorne exclusivamente um JSON válido, sem Markdown, sem comentários e sem texto adicional.

O JSON deve seguir exatamente esta estrutura:

{
  "titulo": "string",
  "plano": {
    "titulo": "string",
    "disciplina": "string",
    "curso": "string",
    "nivel": "string",
    "duracao": "string",
    "tema": "string",
    "objetivos": ["string"],
    "conteudos": ["string"],
    "metodologia": "string",
    "recursos": ["string"],
    "avaliacao": "string"
  },
  "relatorio": "string"
}

Siga o exemplo abaixo de reposta à descrição do professor que pediu "preparar uma aula sobre introdução à engenharia de software para graduação":

{
  "titulo": "Introdução à Engenharia de Software",
  "plano": {
    "titulo": "Introdução à Engenharia de Software",
    "disciplina": "Engenharia de Software",
    "curso": "Graduação em Computação",
    "nivel": "Iniciante",
    "duracao": "50 minutos",
    "tema": "Conceitos iniciais de Engenharia de Software",
    "objetivos": [
      "Compreender o conceito de Engenharia de Software.",
      "Diferenciar desenvolvimento de software ad hoc de processos sistemáticos.",
      "Identificar a importância da qualidade no desenvolvimento de software."
    ],
    "conteudos": [
      "Definição de Engenharia de Software",
      "Diferença entre programação e Engenharia de Software",
      "Noções de processo de software",
      "Importância da qualidade, manutenção e requisitos"
    ],
    "metodologia": "Aula expositiva dialogada com apresentação de conceitos fundamentais, exemplos de sistemas reais e discussão orientada sobre problemas comuns em projetos de software.",
    "recursos": [
      "Projetor",
      "Computador",
      "Slides",
      "Quadro"
    ],
    "avaliacao": "Participação dos estudantes na discussão e resposta individual a uma pergunta reflexiva ao final da aula."
  },
  "relatorio": "Plano de Aula: Introdução à Engenharia de Software\n\nDisciplina: Engenharia de Software\nCurso: Graduação em Computação\nNível: Iniciante\nDuração: 50 minutos\nTema: Conceitos iniciais de Engenharia de Software\n\nObjetivos:\n- Compreender o conceito de Engenharia de Software.\n- Diferenciar desenvolvimento de software ad hoc de processos sistemáticos.\n- Identificar a importância da qualidade no desenvolvimento de software.\n\nConteúdos:\n- Definição de Engenharia de Software.\n- Diferença entre programação e Engenharia de Software.\n- Noções de processo de software.\n- Importância da qualidade, manutenção e requisitos.\n\nMetodologia:\nA aula será conduzida de forma expositiva dialogada, com apresentação dos conceitos fundamentais da Engenharia de Software e uso de exemplos de sistemas reais. Durante a aula, os estudantes serão convidados a refletir sobre problemas comuns em projetos de software, como falta de requisitos claros, baixa qualidade, retrabalho e dificuldades de manutenção.\n\nRecursos:\n- Projetor.\n- Computador.\n- Slides.\n- Quadro.\n\nAvaliação:\nA avaliação ocorrerá por meio da participação dos estudantes na discussão orientada e da resposta individual a uma pergunta reflexiva ao final da aula, relacionando os conceitos apresentados com situações reais de desenvolvimento de software."
}

Regras para o preenchimento:
- "titulo" deve representar uma única aula.
- "duracao" deve indicar a duração de uma única aula.
- "tema" deve ser específico o suficiente para ser trabalhado em uma única aula.
- "objetivos" deve conter de 2 a 4 objetivos alcançáveis em uma única aula. Cada objetivo deve ser uma string e NÃO uma estrutura de objetos.
- "conteudos" deve conter de 2 a 5 tópicos adequados para uma única aula. Cada conteudo deve ser uma string e NÃO uma estrutura de objetos.
- "metodologia" deve descrever apenas as estratégias usadas nesta aula. Cada metodologia deve ser uma string e NÃO uma estrutura de objetos.
- "avaliacao" deve descrever uma forma simples de avaliação aplicável nesta aula.

Regras para o relatório:
- O campo "relatorio" deve conter um texto bem escrito, organizado e pronto para ser exibido ao professor.
- O relatório deve descrever apenas uma aula.
- O relatório deve ser compatível com a duração indicada.
- O relatório não deve mencionar sequência de aulas, aulas futuras ou cronograma de disciplina.
`.trim();
}
