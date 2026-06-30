FROM node:current-alpine3.23 as base

WORKDIR /app

COPY package*.json ./

# ----------------
FROM base as development

RUN npm install

COPY . .

CMD ["npm" , "run", "dev"]

# ----------------
FROM base as test

RUN npm install

COPY . . 

CMD ["npm", "test"]

# ----------------
FROM base as build

COPY . .

RUN npm install
RUN npm run build

# ----------------
# ⚠️ O SEU ESTÁGIO DE PRODUÇÃO CORRIGIDO FICA ASSIM:
FROM base as production

WORKDIR /app

ENV NODE_ENV=production

# Instala apenas as dependências de produção
RUN npm install --omit=dev

# 1. Copia o código compilado do estágio de build
COPY --from=build /app/dist ./dist

# 2. 🔥 MODIFICAÇÃO AQUI: Copia a pasta docs para a raiz do container (/app/docs)
COPY ./docs ./docs

# 3. Garante que o package.json e scripts estão atualizados para rodar o "npm start"
COPY package*.json ./

CMD ["npm", "start"]