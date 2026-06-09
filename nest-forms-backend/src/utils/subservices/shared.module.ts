import { Global, Module } from '@nestjs/common'

import BaConfigModule from '../../config/ba-config.module'
import FormRegistrationStatusRepository from '../../nases/repositories/form-registration-status.repository'
import PrismaModule from '../../prisma/prisma.module'
import ThrowerErrorGuard from '../guards/thrower-error.guard'
import MinioClientSubservice from './minio-client.subservice'

/**
 * SharedModule is a global module that provides commonly used services and utilities
 * across the entire application. Being marked as @Global(), it's automatically available
 * in all other modules without needing to be explicitly imported.
 *
 * ## What can be imported:
 * - Only "leaf modules" (modules with no dependencies on other feature modules)
 * - Currently imports: BaConfigModule, MailerModule
 * - Do NOT import feature modules to avoid circular dependencies
 *
 * ## What can be provided:
 * - Subservices: Reusable business logic services
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
  imports: [BaConfigModule, PrismaModule],
  providers: [
    ThrowerErrorGuard,
    MinioClientSubservice,
    FormRegistrationStatusRepository,
  ],
  exports: [
    ThrowerErrorGuard,
    MinioClientSubservice,
    FormRegistrationStatusRepository,
    PrismaModule,
  ],
})
export class SharedModule {}
