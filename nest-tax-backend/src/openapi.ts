import type { INestApplication } from '@nestjs/common'
import type { OpenApiContract } from 'openapi-cli'

import { AppModule } from './app.module'
import { createSwaggerDocument, prepareApp } from './swagger'

/**
 * The contract `openapi-cli` loads to build this backend's OpenAPI document offline.
 *
 * `prepareApp` and `createSwaggerDocument` are the same functions `main.ts` applies to the
 * running server, so the emitted document cannot drift from the served one.
 *
 * The port is fixed rather than read from `PORT` so the emitted document is identical on
 * every machine, and passing it explicitly keeps `BaConfigService` — and therefore provider
 * instantiation — out of this.
 */
export default {
  projectName: 'tax',
  AppModule,
  prepareApp,
  createSwaggerDocument: (app: INestApplication) =>
    createSwaggerDocument(app, 3000),
} satisfies OpenApiContract
