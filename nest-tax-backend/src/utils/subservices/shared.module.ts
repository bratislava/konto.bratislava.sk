import { Global, Module } from '@nestjs/common'

import ClientsModule from '../../clients/clients.module'
import ThrowerErrorGuard from '../guards/errors.guard'
import { CityAccountSubservice } from './cityaccount.subservice'
import { CognitoSubservice } from './cognito.subservice'
import DatabaseSubservice from './database.subservice'

/**
 * SharedModule is a global module that provides commonly used services and utilities
 * across the entire application. Being marked as @Global(), it's automatically available
 * in all other modules without needing to be explicitly imported.
 *
 * ## What can be imported:
 * - Only "leaf modules" (modules with no dependencies on other feature modules)
 * - Currently imports: ClientsModule
 * - Do NOT import feature modules to avoid circular dependencies
 *
 * ## What can be provided:
 * - Subservices: Reusable business logic services (e.g., CityAccountSubservice, CognitoSubservice)
 * - Guards: Global guards like ThrowerErrorGuard
 * - Utilities: Cross-cutting concerns that don't belong to a specific feature
 *
 * ## What should NOT be added:
 * - Feature-specific services (create a dedicated module instead)
 * - Services with complex dependencies on feature modules
 * - Controllers (this is a service-only module)
 *
 * ## Usage:
 * Since this is a @Global() module, all exported providers are automatically available
 * for injection in any module without adding SharedModule to the imports array.
 */
@Global()
@Module({
  imports: [ClientsModule], // Only leaf modules can be imported here.
  providers: [
    ThrowerErrorGuard,
    CityAccountSubservice,
    CognitoSubservice,
    DatabaseSubservice,
  ],
  exports: [
    ThrowerErrorGuard,
    CityAccountSubservice,
    CognitoSubservice,
    DatabaseSubservice,
  ],
})
export class SharedModule {}
