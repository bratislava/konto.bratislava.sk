import { Controller } from '@nestjs/common'
import { ApiExtraModels, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { IntegrationService } from './integration.service'
import {
  LegalPersonContactAndIdInfoResponseDto,
  UserContactAndIdInfoResponseDto,
} from '../user/dtos/user-contact-info.dto'

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
@ApiExtraModels(UserContactAndIdInfoResponseDto, LegalPersonContactAndIdInfoResponseDto)
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}
}
