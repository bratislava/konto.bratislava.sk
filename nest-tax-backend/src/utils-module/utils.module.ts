import { Module } from '@nestjs/common'

import { RetryService } from './retry.service'

/**
 * 🔧 Utils Module - Reusable Utilities for Multiple Modules
 *
 * This module provides small subservices and utilities that are used across
 * multiple other modules in the application.
 *
 * ⚠️ IMPORTANT RESTRICTIONS:
 * - Services in this module MUST NOT import any other modules
 * - This module should ONLY provide reusable utilities
 *
 * Use this module for:
 * - Small utility services used in multiple places
 * - Helper functions that don't belong to a specific domain
 * - Reusable logic that doesn't depend on other business modules
 */
@Module({
  providers: [RetryService],
  exports: [RetryService],
  imports: [
    /** 🚫 This must stay empty! Services here must not depend on other modules. */
  ],
})
export class UtilsModule {}
