import type { INestApplication } from '@nestjs/common'
import type { OpenApiContract } from 'openapi-cli'

import { AppModule } from './app.module'
import { createSwaggerDocument } from './swagger'

/**
 * The contract `openapi-cli` loads to build this backend's OpenAPI document offline.
 *
 * `AppModule` is instantiated in preview mode, so no provider is constructed and nothing
 * connects to ClamAV or Minio. Note `main.ts` also sets `globalThis.cronRunning` before
 * creating the app; that is never reached here, which is safe precisely because the cron
 * service is never constructed under preview mode.
 *
 * The port is fixed rather than read from `PORT` so the emitted document is identical on
 * every machine, and passing it explicitly keeps `BaConfigService` — and therefore provider
 * instantiation — out of this.
 */
export default {
  projectName: 'clamav-scanner',
  AppModule,
  createSwaggerDocument: (app: INestApplication) =>
    createSwaggerDocument(app, 3000),
} satisfies OpenApiContract
