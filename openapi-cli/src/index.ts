/**
 * The public surface of this package: the contract each backend implements in its
 * `src/openapi.ts`. Everything else here is internal to the CLI.
 *
 * Type-only — importing this at runtime pulls in nothing.
 */
export type { NestModuleClass, OpenApiContract } from './types'
