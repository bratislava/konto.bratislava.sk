import { generateOpenApiClientsCli } from 'openapi-clients/generate-nest'

import AppModule from './app.module'
import { createSwaggerDocument } from './bootstrap'

generateOpenApiClientsCli({
  appModule: AppModule,
  createSwaggerDocument: (app) => createSwaggerDocument(app as any, 3000),
  project: 'forms-backend',
})
