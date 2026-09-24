import { IncomingHttpHeaders } from 'node:http'

import { AllowList, ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'
import { Controller, Get, Headers, UseGuards } from '@nestjs/common'
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'

import AdminGuard from '../auth/guards/admin.guard'
import { ValidateFormRegistrationsResultDto } from '../nases/dtos/responses.dto'
import NasesCronService from '../nases/services/nases.cron.service'
import AdminService from './admin.service'

@ApiTags('ADMIN')
@Controller('admin')
@ApiSecurity('apiKey')
export default class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly nasesCronService: NasesCronService,
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
    return this.adminService.createTechnicalAccountJwtToken()
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
    return this.adminService.createAdministrationJwtToken()
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
      throw this.errorFactoryService.UnauthorizedException({
        errorEnum: ErrorEnum.UNAUTHORIZED_ERROR,
        message: 'Authorization not provided',
      })
    }
    return this.adminService.createUserJwtToken(head.authorization)
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
  @AllowList(true)
  @Get('check-form-registrations-in-nases')
  async checkFormsRegistrationsInNases(): Promise<ValidateFormRegistrationsResultDto> {
    return this.nasesCronService.validateFormRegistrations()
  }
}
