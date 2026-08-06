import type { INestApplication } from '@nestjs/common'
import type { OpenApiContract } from 'openapi-cli'

import AppModule from './app.module'
import { createSwaggerDocument } from './bootstrap'

/**
 * The contract `openapi-cli` loads to build this backend's OpenAPI document offline.
 *
 * `AppModule` is instantiated in preview mode, so no provider is constructed and nothing
 * connects to a database or broker.
 *
 * The port is fixed rather than read from `PORT` so the emitted document is identical on
 * every machine: `ConfigModule.forRoot()` loads `.env` even under preview mode, which would
 * otherwise leak a developer's local port into a committed spec. Passing it explicitly is
 * also what keeps `BaConfigService` — and therefore provider instantiation — out of this.
 */
export default {
  projectName: 'forms',
  AppModule,
  createSwaggerDocument: (app: INestApplication) =>
    createSwaggerDocument(app, 3000),
} satisfies OpenApiContract
