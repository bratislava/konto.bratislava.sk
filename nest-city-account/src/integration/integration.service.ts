import { Injectable } from '@nestjs/common'

/**
 * IntegrationService - Thin delegation layer for backend-to-backend integration APIs
 *
 * This service exposes stable integration endpoints by delegating to domain services.
 * It exists to provide a clean separation between integration APIs and internal domain logic.
 */
@Injectable()
export class IntegrationService {
  constructor() {}
}
