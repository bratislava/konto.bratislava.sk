import type { INestApplication } from '@nestjs/common'
import type { OpenAPIObject } from '@nestjs/swagger'

export type NestModuleClass = new (...args: never[]) => unknown

/** Emitted JavaScript, keyed by the normalized absolute path of its `.ts` source. */
export type CompiledSources = Map<string, string>

/** TypeScript reports forward slashes; `require` reports native separators. */
export const normalizePath = (path: string): string => path.replace(/\\/g, '/')

/**
 * What every backend default-exports from its `src/openapi.ts`.
 *
 * Keeping this to plain values is what lets the CLI stay out of each backend's internals —
 * it never reaches into controllers, DTOs or config.
 *
 * ```ts
 * import type { OpenApiContract } from 'openapi-cli'
 *
 * export default {
 *   projectName: 'forms',
 *   AppModule,
 *   createSwaggerDocument,
 * } satisfies OpenApiContract
 * ```
 */
export interface OpenApiContract {
  /** Names the emitted spec: `openapi-specs/<projectName>.json`. */
  projectName: string
  AppModule: NestModuleClass
  /** Must return the same document the running server serves at `/api-json`. */
  createSwaggerDocument(app: INestApplication): OpenAPIObject
  /**
   * Applied to the app after creation, before the document is built. Needed when routes
   * depend on app-level setup rather than on `DocumentBuilder` — `nest-tax-backend` calls
   * `app.enableVersioning()`, without which its `/v2/tax` paths come out wrong.
   */
  prepareApp?(app: INestApplication): void | Promise<void>
}
