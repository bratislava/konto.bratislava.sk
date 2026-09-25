import { NestFactory } from '@nestjs/core'

import AppModule from './app.module'
import { bootstrap } from './bootstrap'
import BaConfigService from './config/ba-config.service'
import { LineLoggerSubservice } from './utils/subservices/line-logger.subservice'

async function main(): Promise<void> {
  const logger = new LineLoggerSubservice('Nest')
  const app = await NestFactory.create(AppModule, {
    logger,
    routeConflictPolicy: { duplicate: 'error', shadow: 'warn' },
    return503OnClosing: true,
  })
  // On SIGTERM, reply 503 to new requests, let in-flight ones finish, then
  // run the lifecycle shutdown hooks.
  app.enableShutdownHooks()

  bootstrap({ app })

  const baConfigService = app.get(BaConfigService)

  await app.listen(baConfigService.self.port)
  logger.log(`Nest is running on port: ${baConfigService.self.port}`)
}

void main()
