import { NestFactory } from '@nestjs/core'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import AppModule from './app.module'
import { createSwaggerDocument } from './bootstrap'

/**
 * Emits the OpenAPI spec using the compile-time `@nestjs/swagger` CLI plugin — the same
 * code path `nest build` (and therefore the deployed server) uses. The plugin rewrites
 * the `@ApiProperty()` decorator arguments during compilation, so no `metadata.ts`, no
 * `loadPluginMetadata()` and no shim are involved.
 *
 * The document itself comes from `createSwaggerDocument` in bootstrap.ts, so this is the
 * same document the server serves at `/api-json`. Passing the port explicitly keeps
 * `BaConfigService` out of it, so the app can stay in `preview` mode — no providers are
 * instantiated and nothing connects to a database or broker.
 */
async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    preview: true,
    logger: false,
  })

  const document = createSwaggerDocument(app, Number(process.env.PORT) || 3000)

  const outFile = join(__dirname, '..', 'spec-plugin.json')
  writeFileSync(outFile, JSON.stringify(document, null, 2))
  // eslint-disable-next-line no-console
  console.log(
    `wrote ${outFile}, schemas: ${Object.keys(document.components?.schemas ?? {}).length}, paths: ${Object.keys(document.paths).length}`,
  )

  await app.close()
}

void main()
