import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import {
  ErrorFilter,
  HttpExceptionFilter,
  TypeErrorFilter,
} from './utils/filters/error.filter'
import { LineLoggerSubservice } from './utils/subservices/line-logger.subservice'

async function bootstrap() {
  const port = process.env.PORT || 3000
  const logger = new LineLoggerSubservice('Nest')
  const app = await NestFactory.create(AppModule)
  app.useLogger(logger)
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
    .setTitle('Nest tax backend')
    .setDescription('Backend for payment taxes and connection to Noris')
    .setVersion('1.0')
    .setContact(
      'Bratislava Inovations',
      'https://inovacie.bratislava.sk',
      'inovacie@bratislava.sk',
    )
    .addServer(`http://localhost:${port}/`)
    .addServer('https://nest-tax-backend.dev.bratislava.sk/')
    .addServer('https://nest-tax-backend.staging.bratislava.sk/')
    .addServer('https://nest-tax-backend.bratislava.sk/')
    .addApiKey({ type: 'apiKey', name: 'apiKey', in: 'header' }, 'apiKey')
    .addBearerAuth({
      type: 'http',
      description: 'Get token from cognito',
      openIdConnectUrl: 'TBD',
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  app.getHttpAdapter().get('/spec-json', (req, res) => res.json(document))

  await app.listen(port)
  logger.log(`Nest is running on port: ${port}`)
}
// eslint-disable-next-line unicorn/prefer-top-level-await
bootstrap()
