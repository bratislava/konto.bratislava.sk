import {
  ErrorFilter,
  HttpExceptionFilter,
  UnknownExceptionFilter,
} from '@bratislava/log-nest'
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type { Request, Response } from 'express'

import BaConfigService from './config/ba-config.service'

function setupCors(app: INestApplication) {
  const corsOptions = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  }
  app.enableCors(corsOptions)
}

function setupGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe())
}

function setupGlobalFilters(app: INestApplication) {
  app.useGlobalFilters(new UnknownExceptionFilter())
  app.useGlobalFilters(new ErrorFilter())
  app.useGlobalFilters(new HttpExceptionFilter())
}

function setupSwagger(app: INestApplication) {
  const baConfigService = app.get(BaConfigService)

  const config = new DocumentBuilder()
    .setTitle('Nest tax backend')
    .setDescription('Backend for payment taxes and connection to Noris')
    .setVersion('1.0')
    .setContact(
      'Bratislava Inovations',
      'https://inovacie.bratislava.sk',
      'inovacie@bratislava.sk',
    )
    .addServer(`http://localhost:${baConfigService.self.port}/`)
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
  app
    .getHttpAdapter()
    .get('/spec-json', (_req: Request, res: Response) => res.json(document))
}

/**
 * Applies the app-wide setup shared by `main.ts` and the e2e tests, so the tests run against the same versioning,
 * pipes and filters as production. CORS and Swagger are skipped in the test environment.
 */
export function bootstrap({
  app,
  testEnvironment = false,
}: {
  app: INestApplication
  testEnvironment?: boolean
}) {
  app.enableVersioning({
    type: VersioningType.URI,
  })

  if (!testEnvironment) {
    setupCors(app)
  }

  setupGlobalPipes(app)
  setupGlobalFilters(app)

  if (!testEnvironment) {
    setupSwagger(app)
  }
}
