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

FROM base as production

WORKDIR /app

ENV NODE_ENV=production

RUN npm install --omit=dev

# Copia o código compilado e a documentação OpenAPI
COPY --from=build /app/dist ./dist
COPY --from=build /app/docs ./docs

CMD ["npm", "start"]