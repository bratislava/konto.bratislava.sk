// utils/shared.module.ts
import { CognitoSubservice } from './cognito.subservice'
import ThrowerErrorGuard from '../guards/errors.guard'
import { TaxSubservice } from './tax.subservice'
import { ConfigModule } from '@nestjs/config'
import ClientsModule from '../../clients/clients.module'
import { PrismaModule } from '../../prisma/prisma.module'
import { Global, Module } from '@nestjs/common'
import { TurnstileSubservice } from './turnstile.subservice'

/**
 * SharedModule is a global module that provides commonly used services and utilities
 * across the entire application. Being marked as @Global(), it's automatically available
 * in all other modules without needing to be explicitly imported.
 *
 * ## What can be imported:
 * - Only "leaf modules" (modules with no dependencies on other feature modules)
 * - Currently imports: PrismaModule, ClientsModule, ConfigModule
 * - Do NOT import feature modules to avoid circular dependencies
 *
 * ## What can be provided:
 * - Subservices: Reusable business logic services (e.g., CognitoSubservice, TaxSubservice)
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
  imports: [PrismaModule, ClientsModule, ConfigModule], // Only leaf modules can be imported here.
  providers: [ThrowerErrorGuard, TaxSubservice, CognitoSubservice, TurnstileSubservice],
  exports: [ThrowerErrorGuard, TaxSubservice, CognitoSubservice, TurnstileSubservice],
})
export class SharedModule {}
