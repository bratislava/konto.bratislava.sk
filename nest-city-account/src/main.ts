import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import BaConfigService from './config/ba-config.service'
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
  const config = new DocumentBuilder()
    .setTitle('User Module - city account')
    .setDescription(
      'User module use for store additional data for users and authentication against Azure AD'
    )
    .setVersion('1.0')
    .setContact('Bratislava Inovations', 'https://inovacie.bratislava.sk', 'inovacie@bratislava.sk')
    .addServer(`http://localhost:${baConfigService.self.port}/`)
    .addServer('https://nest-city-account.dev.bratislava.sk/')
    .addServer('https://nest-city-account.staging.bratislava.sk/')
    .addServer('https://nest-city-account.bratislava.sk/')
    .addApiKey({ type: 'apiKey', name: 'apiKey', in: 'header' }, 'apiKey')
    .addBearerAuth({
      type: 'http',
      description: 'Get token from cognito',
      openIdConnectUrl: 'TBD',
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(baConfigService.self.port)
  logger.log(`Nest is running on port: ${baConfigService.self.port}`)
}
void bootstrap()
