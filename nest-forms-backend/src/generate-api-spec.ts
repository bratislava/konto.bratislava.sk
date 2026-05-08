import { NestFactory } from '@nestjs/core'
import { generateOpenApiClientsCli } from 'openapi-clients/generate-nest'

import AppModule from './app.module'
import { createSwaggerDocument } from './bootstrap'

generateOpenApiClientsCli({
  createApp: async () =>
    NestFactory.create(AppModule, {
      preview: true,
      abortOnError: false,
    }),
  // @ts-ignore
  createSwaggerDocument: (app) => createSwaggerDocument(app, 3000),
  project: 'forms-backend',
})
