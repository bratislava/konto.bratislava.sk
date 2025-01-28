/* eslint-disable no-console */
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import express from 'express'

import AppModule from './app.module'
import { INNOVATION_MAIL } from './utils/constants'
import { ErrorFilter, HttpExceptionFilter } from './utils/filters/error.filter'
import { LineLoggerSubservice } from './utils/subservices/line-logger.subservice'

async function bootstrap(): Promise<void> {
  const port = process.env.PORT || 3000
  const app = await NestFactory.create(AppModule, {
    logger: new LineLoggerSubservice('Nest'),
  })
  const corsOptions = {
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://nest-forms-backend.dev.bratislava.sk',
      'https://nest-forms-backend.staging.bratislava.sk',
      'https://nest-forms-backend.bratislava.sk',
      'https://city-account-next.dev.bratislava.sk',
      'https://city-account-next.staging.bratislava.sk',
      'https://city-account-next.bratislava.sk',
      'https://konto.bratislava.sk',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  }
  app.enableCors(corsOptions)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
    }),
  )
  app.useGlobalFilters(new ErrorFilter()) // This filter must be first
  app.useGlobalFilters(new HttpExceptionFilter())
  const config = new DocumentBuilder()
    .setTitle('Nest Forms Backend')
    .setDescription('Backend od processing forms and handling the attachments')
    .setVersion('1.0')
    .setContact(
      'Bratislava Innovations',
      'https://inovacie.bratislava.sk',
      INNOVATION_MAIL,
    )
    .addServer(`http://localhost:${port}/`)
    .addServer('https://nest-forms-backend.dev.bratislava.sk/')
    .addServer('https://nest-forms-backend.staging.bratislava.sk/')
    .addServer('https://nest-forms-backend.bratislava.sk/')
    .addBearerAuth({
      type: 'http',
      description:
        'Get token from cognito, use in normal requests without eid. Get token from slovensko.sk, use in endpoints with eid',
      openIdConnectUrl: 'TBD',
    })
    .addBasicAuth({
      type: 'http',
      description: 'Basic auth for communication with scanner backend',
    })
    .addApiKey({ type: 'apiKey', name: 'apiKey', in: 'header' }, 'apiKey')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  app
    .getHttpAdapter()
    .get('/spec-json', (req: express.Request, res: express.Response) =>
      res.json(document),
    )

  await app.listen(port)
  console.log(`Nest is running on port: ${port}`)
  console.log(`RabbitMQ uri: ${<string>process.env.RABBIT_MQ_URI}`)
}
// eslint-disable-next-line unicorn/prefer-top-level-await, @typescript-eslint/no-floating-promises
bootstrap()

/* eslint-enable no-console */
