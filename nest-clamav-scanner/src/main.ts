import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import BaConfigService from './config/ba-config.service'
import { createSwaggerDocument } from './swagger'

async function bootstrap() {
  globalThis.cronRunning = false

  const app = await NestFactory.create(AppModule)
  const baConfigService = app.get(BaConfigService)
  const document = createSwaggerDocument(app)
  SwaggerModule.setup('api', app, document)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.getHttpAdapter().get('/spec-json', (req, res) => res.json(document))

  await app.listen(baConfigService.self.port)
  // eslint-disable-next-line no-console
  console.log(`Nest is running on port: ${baConfigService.self.port}`)
}

void bootstrap()
