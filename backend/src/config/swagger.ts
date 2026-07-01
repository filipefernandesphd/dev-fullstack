import path from 'path';

import swaggerUi from 'swagger-ui-express';

import SwaggerParser from '@apidevtools/swagger-parser';

import { Express } from 'express';

import { config } from './env';

export const setupSwagger = async (app: Express) => {
    /**
     * Caminho absoluto para o arquivo OpenAPI.
     *
     * Usamos __dirname em vez de caminho relativo (./docs/openapi.yaml)
     * porque o diretório de trabalho (process.cwd()) pode variar:
     * - Local: a raiz do backend (/app ou ./backend)
     * - Render/Docker: pode ser diferente dependendo da config
     *
     * swagger.ts está em: src/config/swagger.ts
     * openapi.yaml está em: docs/openapi.yaml
     * Então: __dirname + /../../docs/openapi.yaml
     */
    const caminhoOpenApi = path.resolve(__dirname, '../../docs/openapi.yaml');

    const spec = await SwaggerParser.dereference(caminhoOpenApi) as any;

    spec.servers = [
        {
            url: config.urlApi,
            description: `Servidor ${config.nodeEnv}`
        }
    ]

    app.use('/docs' , swaggerUi.serve, swaggerUi.setup(spec));
};
