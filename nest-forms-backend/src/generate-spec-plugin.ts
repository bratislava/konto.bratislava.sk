import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import AppModule from './app.module'

/**
 * Emits the OpenAPI spec using the compile-time `@nestjs/swagger` CLI plugin — the same
 * code path `nest build` (and therefore staging) uses. The plugin rewrites the
 * `@ApiProperty()` decorator arguments during compilation, so no `metadata.ts`, no
 * `loadPluginMetadata()` and no shim are involved.
 *
 * Must be run from the compiled output (`dist/`), because the plugin only applies when
 * the sources are compiled through `nest build`.
 */
async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    preview: true,
    logger: false,
  })

  const config = new DocumentBuilder()
    .setTitle('Nest Forms Backend')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  const outFile = join(__dirname, '..', 'spec-plugin.json')
  writeFileSync(outFile, JSON.stringify(document, null, 2))
  // eslint-disable-next-line no-console
  console.log(
    `wrote ${outFile}, schemas: ${Object.keys(document.components?.schemas ?? {}).length}, paths: ${Object.keys(document.paths).length}`,
  )

  await app.close()
}

void main()
