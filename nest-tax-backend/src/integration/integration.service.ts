import { Injectable } from '@nestjs/common'
import { NorisService } from '../noris/noris.service'
import { RequestUpdateNorisDeliveryMethodsDto } from '../admin/dtos/requests.dto'

/**
 * IntegrationService - Thin delegation layer for backend-to-backend integration APIs
 *
 * This service exposes stable integration endpoints by delegating to domain services.
 * It exists to provide a clean separation between integration APIs and internal domain logic.
 */
@Injectable()
export class IntegrationService {
  constructor(private readonly norisService: NorisService) {}

  async updateDeliveryMethodsInNoris(
    data: RequestUpdateNorisDeliveryMethodsDto,
  ) {
    return await this.norisService.updateDeliveryMethodsInNoris(data)
  }

  async removeDeliveryMethodsFromNoris(birthNumber: string) {
    await this.norisService.removeDeliveryMethodsFromNoris(birthNumber)
  }
}
