import type { INestApplication } from '@nestjs/common'
import type { OpenApiContract } from 'openapi-cli'

import { AppModule } from './app.module'
import { createSwaggerDocument } from './swagger'

/**
 * The contract `openapi-cli` loads to build this backend's OpenAPI document offline.
 *
 * `AppModule` is instantiated in preview mode, so no provider is constructed and nothing
 * connects to a database or external service. The port is fixed rather than read from `PORT`
 * so the emitted document is identical on every machine, and passing it explicitly keeps
 * `BaConfigService` — and therefore provider instantiation — out of this.
 */
export default {
  projectName: 'city-account',
  AppModule,
  createSwaggerDocument: (app: INestApplication) =>
    createSwaggerDocument(app, 3000),
} satisfies OpenApiContract
