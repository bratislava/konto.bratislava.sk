import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { createSwaggerDocument } from './bootstrap'

async function generateApiSpec() {
  const app = await NestFactory.create(AppModule, {
    preview: true,
    abortOnError: false,
  })

  const document = createSwaggerDocument(app, 3000)

  const outputPath =
    process.env.API_SPEC_OUTPUT_PATH ?? join(process.cwd(), 'api-spec.json')
  writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8')

  console.log(`API specification generated at: ${outputPath}`)

  await app.close()
}

// eslint-disable-next-line unicorn/prefer-top-level-await
generateApiSpec()
