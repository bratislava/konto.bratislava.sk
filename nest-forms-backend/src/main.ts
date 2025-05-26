import { NestFactory } from '@nestjs/core'

import { bootstrap } from './app'
import AppModule from './app.module'
import BaConfigService from './config/ba-config.service'
import { LineLoggerSubservice } from './utils/subservices/line-logger.subservice'

async function run() {
  const app = await NestFactory.create(AppModule, {
    logger: new LineLoggerSubservice('Nest'),
  })
  bootstrap({ app })

  const baConfigService = app.get(BaConfigService)
  await app.listen(baConfigService.self.port)
  // eslint-disable-next-line no-console
  console.log(`Nest is running on port: ${baConfigService.self.port}`)
}

// eslint-disable-next-line unicorn/prefer-top-level-await
run()
