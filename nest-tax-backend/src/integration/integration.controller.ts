import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'

import { RequestUpdateNorisDeliveryMethodsDto } from '../admin/dtos/requests.dto'
import { UpdateDeliveryMethodsInNorisResponseDto } from '../admin/dtos/responses.dto'
import { AdminGuard } from '../auth/guards/admin.guard'
import { IntegrationService } from './integration.service'

/**
 * IntegrationController - Backend-to-Backend Integration APIs
 *
 * This controller exposes stable API endpoints for programmatic access by other backend services.
 * These endpoints are versioned and maintained for stability.
 *
 * Route prefix: /integration
 */
@ApiTags('Backend Integration API')
@ApiSecurity('apiKey')
@UseGuards(AdminGuard)
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Update delivery methods for given birth numbers and date.',
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Records successfully updated in Noris',
    type: UpdateDeliveryMethodsInNorisResponseDto,
  })
  @UseGuards(AdminGuard)
  @Post('update-delivery-methods-in-noris')
  async updateDeliveryMethodsInNoris(
    @Body() data: RequestUpdateNorisDeliveryMethodsDto,
  ): Promise<UpdateDeliveryMethodsInNorisResponseDto> {
    return await this.integrationService.updateDeliveryMethodsInNoris(data)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Remove delivery methods for given birth number.',
    description:
      "⚠️ Must be called only through nest-city-account, which is the source of truth for delivery methods. Calling this endpoint directly bypasses nest-city-account's business logic (including the per-birth-number advisory lock) and can leave Noris in an incorrect state.",
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Records successfully updated in Noris',
  })
  @UseGuards(AdminGuard)
  @Post('remove-delivery-methods-from-noris/:birthNumber')
  async removeDeliveryMethodsFromNoris(
    @Param('birthNumber') birthNumber: string,
  ): Promise<void> {
    await this.integrationService.removeDeliveryMethodsFromNoris(birthNumber)
  }
}
