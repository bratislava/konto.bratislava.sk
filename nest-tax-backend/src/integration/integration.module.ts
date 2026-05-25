import { Module } from '@nestjs/common'

import { IntegrationService } from './integration.service'
import { IntegrationController } from './integration.controller'

/**
 * IntegrationModule - Backend-to-Backend Integration APIs
 *
 * This module provides stable API endpoints for programmatic access by other backend services.
 * It acts as a thin layer that exposes functionality from domain modules (User, Verification, PhysicalEntity).
 */
@Module({
  imports: [],
  providers: [IntegrationService],
  controllers: [IntegrationController],
  exports: [],
})
export class IntegrationModule {}
