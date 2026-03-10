import { NestFactory } from '@nestjs/core'

import AppModule from './app.module'
import { bootstrap } from './bootstrap'
import BaConfigService from './config/ba-config.service'
import { LineLoggerSubservice } from './utils/subservices/line-logger.subservice'

async function main(): Promise<void> {
  const logger = new LineLoggerSubservice('Nest')
  const app = await NestFactory.create(AppModule, {
    logger,
  })

  bootstrap({ app })

  const baConfigService = app.get(BaConfigService)

  await app.listen(baConfigService.self.port)
  logger.log(`Nest is running on port: ${baConfigService.self.port}`)
  logger.log(`RabbitMQ uri: ${process.env.RABBIT_MQ_URI as string}`)
}

 
void main()
