import { generateOpenApiClientsCli } from 'openapi-clients/generate-nest'

import AppModule from '../src/app.module'
import { createSwaggerDocument } from '../src/bootstrap'

generateOpenApiClientsCli({
  appModule: AppModule,
  // @ts-expect-error
  createSwaggerDocument,
  project: 'forms-backend',
})
