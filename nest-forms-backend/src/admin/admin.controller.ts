import { IncomingHttpHeaders } from 'node:http'

import { Controller, Get, Headers, HttpStatus, UseGuards } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'

import AdminGuard from '../auth/guards/admin.guard'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import { UnauthorizedErrorDto } from '../utils/global-dtos/errors.dto'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'

@ApiTags('ADMIN')
@Controller('admin')
@ApiSecurity('apiKey')
export default class AdminController {
  constructor(
    private readonly nasesUtilsService: NasesUtilsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  // Endpoints only for testing

  @ApiOperation({
    summary: '',
    description: 'Return technical account JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Generated JWT token',
    type: 'string',
  })
  @UseGuards(AdminGuard)
  @Get('technical-jwt')
  getTechnicalJwt(): string {
    return this.nasesUtilsService.createTechnicalAccountJwtToken()
  }

  @ApiOperation({
    summary: '',
    description: 'Return administration account JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Generated JWT token',
    type: 'string',
  })
  @UseGuards(AdminGuard)
  @Get('administration-jwt')
  getAdministrationJwt(): string {
    return this.nasesUtilsService.createAdministrationJwtToken()
  }

  @ApiOperation({
    summary: '',
    description: 'Return eid user JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Generated JWT token',
    type: 'string',
  })
  @ApiExtraModels(UnauthorizedErrorDto)
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
    schema: {
      anyOf: [
        {
          $ref: getSchemaPath(UnauthorizedErrorDto),
        },
      ],
    },
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
    return this.nasesUtilsService.createUserJwtToken(head.authorization)
  }
}
