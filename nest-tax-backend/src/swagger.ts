import { INestApplication, VersioningType } from '@nestjs/common'
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'

import BaConfigService from './config/ba-config.service'

/**
 * App-level setup the emitted paths depend on, applied before the document is built.
 *
 * URI versioning is what puts `/v2` in front of every `@Controller({ version: '2' })` route.
 * It lives here, next to `createSwaggerDocument`, so `main.ts` and the offline generator
 * share one definition — if they drifted apart the spec would still build, still report the
 * same number of paths, and quietly document the wrong URLs.
 */
export function prepareApp(app: INestApplication): void {
  app.enableVersioning({ type: VersioningType.URI })
}

/**
 * Builds the exact OpenAPI document the running server serves at `/api-json`.
 *
 * Lives here rather than in `main.ts` so it can be reused without importing that file's
 * top-level `bootstrap()` call, which would start the server.
 *
 * `overridePort` supplies the port for the localhost server entry. Passing it avoids
 * resolving `BaConfigService`, which lets callers generate the document from an app created
 * in `preview` mode — i.e. without instantiating any providers.
 */
export function createSwaggerDocument(
  app: INestApplication,
  overridePort?: number,
): OpenAPIObject {
  const port = overridePort ?? app.get(BaConfigService).self.port

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

  return SwaggerModule.createDocument(app, config)
}
