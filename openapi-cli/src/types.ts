import type { INestApplication } from '@nestjs/common'
import type { OpenAPIObject } from '@nestjs/swagger'

export type NestModuleClass = new (...args: never[]) => unknown

/**
 * What every backend's contract module (see `BackendConfig.entry`) must export.
 *
 * Keeping this to plain exported values is what lets the CLI stay out of each backend's
 * internals — it never reaches into controllers, DTOs or config.
 */
export interface OpenApiContract {
  AppModule: NestModuleClass
  createSwaggerDocument(
    app: INestApplication,
    overridePort?: number,
  ): OpenAPIObject
  /**
   * Applied to the app after creation, before the document is built. Needed when routes
   * depend on app-level setup rather than on `DocumentBuilder` — `nest-tax-backend` calls
   * `app.enableVersioning()`, without which its `/v2/tax` paths come out wrong.
   */
  prepareApp?(app: INestApplication): void | Promise<void>
}

export interface BackendConfig {
  /** Workspace package name, matched against the cwd's `package.json` name. */
  packageName: string
  /** Contract module, relative to the backend package root. */
  entry: string
  /** tsconfig whose file list and options the in-memory compile uses. */
  tsconfig: string
  /** Port for the `http://localhost:<port>/` server entry in the document. */
  port: number
}
