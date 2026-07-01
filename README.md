# MeuPlano.AI

Professores gastam muito tempo criando planos de aula claros, organizados e adaptados a diferentes turmas.

O **MeuPlano.AI** usa Inteligência Artificial para gerar sugestões estruturadas de planos de aula, permitindo que o professor revise, edite e salve seus planejamentos com mais rapidez.

> Este projeto é exclusivo para fins didáticos para a disciplina de **Desenvolvimento Full Stack** do curso de Especialização em Desenvolvimento Full Stack do IF Sudeste MG - *Campus* Manhuaçu, ofertado pelo [Prof. Dr. Filipe Fernandes](https://filipefernandesphd.com).

## URL do App (Produção)

- **Frontend (Vercel):** https://dev-fullstack-meu-plano-ia.vercel.app
- **Backend (Render):** https://dev-fullstack-meu-plano-ia-2.onrender.com

> ⚠️ O backend no Render free tier "dorme" após inatividade. A primeira requisição pode levar ~30s (cold start).

## Estrutura do Projeto

O mono-repositório contém a implementação do app **MeuPlano.AI** e está estruturado da seguinte forma:

* **[backend](./backend):** implementação da API (Express + TypeScript);
* **[docs](./docs)**: documentação para gerência e implementação da aplicação;
* **[frontend](./frontend)**: implementação da interface do usuário (React + TypeScript + Vite);

## Funcionalidades

- 🤖 Geração de rascunho de plano de aula com IA (Google Gemini)
- ✏️ Revisão e melhoria do rascunho com orientações adicionais
- 📄 Geração de versão final em formato de relatório
- 💾 Persistência no MongoDB (Atlas em produção)
- 📋 Exportação do relatório (cópia para área de transferência)

## Tecnologias

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Vitest |
| **Backend** | Express 5, TypeScript, Zod, Mongoose |
| **IA** | Google Gemini (via OpenAI-compatible API) |
| **Banco** | MongoDB (Mongoose ODM) |
| **Infra** | Docker Compose, GitHub Actions |

## Como Rodar

### Pré-requisitos

- Node.js 22+
- npm
- Docker (opcional, para MongoDB local)

### Backend

```bash
cd backend
npm install
npm run dev        # API em http://localhost:3333
npm test           # testes
npm run build      # build de produção
```

Documentação da API disponível em `http://localhost:3333/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev        # App em http://localhost:5173
npm test           # testes
npm run build      # build de produção
```

### Docker (ambiente completo)

```bash
docker compose up -d
```

Sobe: backend, frontend, MongoDB e Ollama.

## Variáveis de Ambiente

### Backend (.env.development)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente | `development` |
| `PORT` | Porta do servidor | `3333` |
| `AI_API_KEY` | Chave da API de IA | `sua-chave-gemini` |
| `AI_MODEL` | Modelo de IA | `gemini-2.5-flash` |
| `AI_API_URL` | URL do provedor de IA | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` |
| `MONGO_URL` | String de conexão MongoDB | `mongodb://localhost:27017/meuplanoai` |
| `CORS_ORIGIN` | Origem permitida no CORS | `http://localhost:5173` |

### Frontend (.env.development)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL base da API | `http://localhost:3333` |

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/planos-de-aula/rascunho` | Gera o primeiro rascunho a partir de descrição em linguagem natural |
| `POST` | `/planos-de-aula/rascunho/melhorar` | Melhora um rascunho com base em novas orientações |
| `POST` | `/planos-de-aula/final` | Gera versão final (relatório) e persiste no MongoDB |

## Deploy

### MongoDB Atlas

1. Crie um cluster free (M0) em [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Obtenha a string de conexão (ex.: `mongodb+srv://usuario:senha@cluster.mongodb.net/meuplanoai?retryWrites=true&w=majority`)
3. Use esta string como `MONGO_URL` no Render

### Render (Backend)

1. Crie um **Web Service** no [Render](https://render.com)
2. Conecte ao repositório, diretório: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Adicione as variáveis de ambiente: `AI_API_KEY`, `AI_MODEL`, `AI_API_URL`, `MONGO_URL`, `CORS_ORIGIN` (URL do Vercel), `NODE_ENV=production`
6. O Render injeta `PORT` automaticamente

### Vercel (Frontend)

1. Crie um projeto no [Vercel](https://vercel.com)
2. Conecte ao repositório, diretório: `frontend`
3. Framework preset: **Vite**
4. Adicione a variável de ambiente: `VITE_API_URL` (URL do backend no Render)
5. Faça o deploy

## Use Cases

### UC01 - Gerar Plano de Aula

**Ator principal**: Professor

**Pré-condições**:

* O sistema deve estar disponível.
* A integração com o serviço de IA deve estar configurada.

**Pós-condições**:

* O professor obtém um plano de aula.
* O professor salva o plano em sua conta.
* O professor exporta o plano em PDF.

**Fluxo Principal**:

1. O professor acessa a tela inicial pública do sistema.
2. O professor informa, em linguagem natural, o plano de aula que deseja gerar.
3. O professor submete a requisição para gerar o plano de aula.
4. O sistema exibe um formulário com os campos preenchidos automaticamente.
5. O professor revisa os campos do formulário.
6. O professor submete a requisição para gerar a versão final do plano de aula.
7. O sistema exibe o plano de aula em formato de relatório e o caso de uso termina.

**Fluxo Alternativo**:

* 3.1. Caso o professor não esteja autenticado, o app requisitará sua autenticação, executa o passo 3 e retorna para o passo 4.
* 5.1. O professor edita os campos manualmente e segue para o passo 6.
* 5.2. O professor envia outras instruções para a IA e retorna para o passo 5.
* 7.1. O professor salva o plano de aula e o caso de uso termina.
* 7.2. O professor exporta o plano de aula como PDF e o caso de uso termina.

### Fluxo Principal - UC01 - Gerar Plano de Aula

```mermaid
sequenceDiagram
    actor Professor
    participant Web as Frontend Web
    participant API as Backend API
    participant IA as Serviço de IA

    Professor->>Web: Acessa tela inicial pública do sistema
    Web-->>Professor: Exibe tela inicial pública

    Professor->>Web: Informa, em linguagem natural, o plano de aula desejado
    Professor->>Web: Submete solicitação para gerar plano de aula

    Web->>API: POST /planos-de-aula/rascunho
    Note over Web,API: Envia descrição em linguagem natural

    API->>IA: Solicita geração do rascunho estruturado
    IA-->>API: Retorna rascunho com campos preenchidos

    API-->>Web: 200 OK - Retorna rascunho do plano de aula
    Web-->>Professor: Exibe formulário com campos preenchidos automaticamente

    Professor->>Web: Revisa os campos do formulário

    loop Enquanto o professor desejar melhorar o rascunho
        Professor->>Web: Envia novas instruções para melhorar o rascunho

        Web->>API: POST /planos-de-aula/rascunho/melhorar
        Note over Web,API: Envia rascunho atual + instruções adicionais

        API->>IA: Solicita melhoria do rascunho
        IA-->>API: Retorna rascunho melhorado

        API-->>Web: 200 OK - Retorna rascunho melhorado
        Web-->>Professor: Exibe formulário atualizado

        Professor->>Web: Revisa os campos do formulário
    end

    Professor->>Web: Submete rascunho revisado para gerar versão final

    Web->>API: POST /planos-de-aula/final
    Note over Web,API: Envia rascunho revisado

    API->>IA: Solicita geração da versão final do plano de aula
    IA-->>API: Retorna plano de aula final em formato de relatório

    API-->>Web: 200 OK - Retorna plano de aula final
    Web-->>Professor: Exibe plano de aula em formato de relatório
```
