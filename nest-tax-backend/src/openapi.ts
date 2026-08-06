import { INestApplication, VersioningType } from '@nestjs/common'
import type { OpenApiContract } from 'openapi-cli'

import { AppModule } from './app.module'
import { createSwaggerDocument } from './swagger'

/**
 * The contract `openapi-cli` loads to build this backend's OpenAPI document offline.
 *
 * `prepareApp` is not optional here: URI versioning is app-level setup that happens outside
 * `DocumentBuilder`, and without it every `@Controller({ version: '2' })` route would be
 * emitted without its `/v2` prefix.
 *
 * The port is fixed rather than read from `PORT` so the emitted document is identical on
 * every machine, and passing it explicitly keeps `BaConfigService` — and therefore provider
 * instantiation — out of this.
 */
export default {
  projectName: 'tax',
  AppModule,
  prepareApp: (app: INestApplication) => {
    app.enableVersioning({ type: VersioningType.URI })
  },
  createSwaggerDocument: (app: INestApplication) =>
    createSwaggerDocument(app, 3000),
} satisfies OpenApiContract
