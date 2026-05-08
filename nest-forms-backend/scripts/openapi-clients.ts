import { NestFactory } from '@nestjs/core'
import { generateOpenApiClientsCli } from 'openapi-clients/generate-nest'

import AppModule from '../src/app.module'
import { createSwaggerDocument } from '../src/bootstrap'

generateOpenApiClientsCli({
  createApp: async () =>
    NestFactory.create(AppModule, {
      preview: true,
      abortOnError: false,
    }),
  // @ts-ignore
  createSwaggerDocument,
  project: 'forms-backend',
})
