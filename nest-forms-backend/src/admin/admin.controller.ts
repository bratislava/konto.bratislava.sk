import { IncomingHttpHeaders } from 'node:http'

import { Controller, Get, Headers, UseGuards } from '@nestjs/common'
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'

import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import AdminGuard from '../auth/guards/admin.guard'
import { ValidateFormRegistrationsResultDto } from '../nases/dtos/responses.dto'
import NasesCronSubservice from '../nases/utils-services/nases.cron.subservice'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'

@ApiTags('ADMIN')
@Controller('admin')
@ApiSecurity('apiKey')
export default class AdminController {
  constructor(
    private readonly apiJwtTokensService: ApiJwtTokensService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly nasesCronSubservice: NasesCronSubservice,
  ) {}

  // Endpoints only for testing

  @ApiOperation({
    summary: '',
    description: 'Return technical account JWT token',
  })
  @ApiOkResponse({
    description: 'Generated JWT token',
    type: 'string',
  })
  @UseGuards(AdminGuard)
  @Get('technical-jwt')
  getTechnicalJwt(): string {
    return this.apiJwtTokensService.createTechnicalAccountJwtToken()
  }

  @ApiOperation({
    summary: '',
    description: 'Return administration account JWT token',
  })
  @ApiOkResponse({
    description: 'Generated JWT token',
    type: 'string',
  })
  @UseGuards(AdminGuard)
  @Get('administration-jwt')
  getAdministrationJwt(): string {
    return this.apiJwtTokensService.createAdministrationJwtToken()
  }

  @ApiOperation({
    summary: '',
    description: 'Return eid user JWT token',
  })
  @ApiOkResponse({
    description: 'Generated JWT token',
    type: 'string',
  })
  @UseGuards(AdminGuard)
  @Get('eid-jwt')
  getEidJwt(@Headers() head: IncomingHttpHeaders): string {
    if (!head.authorization) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        'Authorization not provided',
      )
    }
    return this.apiJwtTokensService.createUserJwtToken(head.authorization)
  }

  @ApiOperation({
    summary:
      'Run check of all form definitions, whether their registration in NASES is valid.',
    description: 'Return the result of the form registration validation',
  })
  @ApiOkResponse({
    description: 'Result of the form registration validation',
    type: ValidateFormRegistrationsResultDto,
  })
  @UseGuards(AdminGuard)
  @Get('check-form-registrations-in-nases')
  async checkFormsRegistrationsInNases(): Promise<ValidateFormRegistrationsResultDto> {
    return this.nasesCronSubservice.validateFormRegistrations()
  }
}
