/**
 * The contract `openapi-cli` loads to build this backend's OpenAPI document offline.
 *
 * `AppModule` is instantiated in preview mode, so no provider is constructed and nothing
 * connects to a database or broker. `createSwaggerDocument` takes the port as an argument,
 * which is what keeps `BaConfigService` — and therefore provider instantiation — out of it.
 */
export { default as AppModule } from './app.module'
export { createSwaggerDocument } from './bootstrap'
