import { NestFactory } from '@nestjs/core'
import { defineNestOpenApiProject } from 'openapi-clients/generate-nest'

import AppModule from './src/app.module'
import { createSwaggerDocument } from './src/bootstrap'

export default defineNestOpenApiProject({
  createApp: async () =>
    NestFactory.create(AppModule, {
      preview: true,
      abortOnError: false,
    }),
  // @ts-ignore
  createSwaggerDocument: (app) => createSwaggerDocument(app, 3000),
  project: 'forms-backend',
})
