import { LineLoggerService } from '@bratislava/log-nest'
import { NestFactory } from '@nestjs/core'

import AppModule from './app.module'
import { bootstrap } from './bootstrap'
import BaConfigService from './config/ba-config.service'

async function main(): Promise<void> {
  const logger = new LineLoggerService('Nest')
  const preview = process.env.NEST_PREVIEW === 'true'
  const app = await NestFactory.create(AppModule, {
    logger,
    preview,
    abortOnError: !preview,
  })

  if (preview) {
    await app.close()
    logger.log('Preview OK: dependency graph resolved')
    return
  }

  bootstrap({ app })

  const baConfigService = app.get(BaConfigService)

  await app.listen(baConfigService.self.port)
  logger.log(`Nest is running on port: ${baConfigService.self.port}`)
}

void main()
