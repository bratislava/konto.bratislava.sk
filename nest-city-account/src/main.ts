import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import BaConfigService from './config/ba-config.service'
import { createSwaggerDocument } from './swagger'
import { ErrorFilter, HttpExceptionFilter, TypeErrorFilter } from './utils/filters/error.filter'
import { LineLoggerSubservice } from './utils/subservices/line-logger.subservice'

async function bootstrap() {
  const logger = new LineLoggerSubservice('Nest')
  const app = await NestFactory.create(AppModule, {
    logger,
  })
  const baConfigService = app.get(BaConfigService)
  const corsOptions = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  }
  app.enableCors(corsOptions)
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new ErrorFilter()) // This filter must be first
  app.useGlobalFilters(new TypeErrorFilter())
  app.useGlobalFilters(new HttpExceptionFilter())
  const document = createSwaggerDocument(app)
  SwaggerModule.setup('api', app, document)

  await app.listen(baConfigService.self.port)
  logger.log(`Nest is running on port: ${baConfigService.self.port}`)
}
void bootstrap()
