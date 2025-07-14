import { INestApplication, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import express, { json } from 'express'

import { cognitoGuestIdentityIdHeaderKey } from './auth-v2/utils/extract-cognito-guest-identity-id-from-request'
import BaConfigService from './config/ba-config.service'
import { INNOVATION_MAIL } from './utils/constants'
import { ErrorFilter, HttpExceptionFilter } from './utils/filters/error.filter'

function setupCors(app: INestApplication) {
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
    allowedHeaders: `Content-Type, Accept, Authorization, ${cognitoGuestIdentityIdHeaderKey}`,
  }
  app.enableCors(corsOptions)
}

function setupGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
    }),
  )
}

function setupGlobalFilters(app: INestApplication) {
  app.useGlobalFilters(new ErrorFilter()) // This filter must be first
  app.useGlobalFilters(new HttpExceptionFilter())
}

function setupMiddleware(app: INestApplication) {
  // https://stackoverflow.com/a/59978098
  app.use(json({ limit: '50mb' }))
}

function setupSwagger(app: INestApplication) {
  const baConfigService = app.get(BaConfigService)

  const config = new DocumentBuilder()
    .setTitle('Nest Forms Backend')
    .setDescription('Backend od processing forms and handling the attachments')
    .setVersion('1.0')
    .setContact(
      'Bratislava Innovations',
      'https://inovacie.bratislava.sk',
      INNOVATION_MAIL,
    )
    .addServer(`http://localhost:${baConfigService.self.port}/`)
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
    .addSecurity('cognitoGuestIdentityId', {
      type: 'apiKey',
      in: 'header',
      name: cognitoGuestIdentityIdHeaderKey,
      description: 'Cognito Guest Identity ID for unauthenticated user access',
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  app
    .getHttpAdapter()
    .get('/spec-json', (req: express.Request, res: express.Response) =>
      res.json(document),
    )
}

export function bootstrap({
  app,
  testEnvironment = false,
}: {
  app: INestApplication
  testEnvironment?: boolean
}) {
  if (!testEnvironment) {
    setupCors(app)
  }

  setupGlobalPipes(app)
  setupGlobalFilters(app)
  setupMiddleware(app)

  if (!testEnvironment) {
    setupSwagger(app)
  }
}
