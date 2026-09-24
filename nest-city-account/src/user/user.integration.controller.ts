import { LogAllowList } from '@bratislava/log-nest'
import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'

import { AdminGuard } from '../auth/guards/admin.guard'
import { CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'
import {
  LegalPersonContactAndIdInfoResponseDto,
  UserContactAndIdInfoResponseDto,
} from './dtos/user-contact-info.dto'
import { UserService } from './user.service'

@ApiTags('User integration')
@ApiSecurity('apiKey')
@ApiExtraModels(UserContactAndIdInfoResponseDto, LegalPersonContactAndIdInfoResponseDto)
@Controller('user-integration')
// `firstName`/`lastName` never make it into the logged response-data - real full names,
// no generic redactor pattern for them. `email`/`birthNumber` are allowed through
// structurally but still masked in content by the global redactors. `name`/`ico` are
// legal-entity (not personal) identifiers, so they're let through as-is.
// Note: the `:externalId` path param below isn't covered by @LogAllowList/redaction at all -
// see the same caveat in admin.controller.ts. Accepted gap, this lookup inherently needs
// the identifier in the path.
@LogAllowList({
  externalId: true,
  accountType: true,
  ico: true,
})
export class UserIntegrationController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get user contact and ID information by external ID',
    description:
      'Returns contact and ID information for user or legal person based on external ID. This endpoint requires API key authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact and ID information retrieved successfully',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(UserContactAndIdInfoResponseDto) },
        { $ref: getSchemaPath(LegalPersonContactAndIdInfoResponseDto) },
      ],
      discriminator: {
        propertyName: 'accountType',
        mapping: {
          [CognitoUserAccountTypesEnum.PHYSICAL_ENTITY]: getSchemaPath(
            UserContactAndIdInfoResponseDto
          ),
          [CognitoUserAccountTypesEnum.LEGAL_ENTITY]: getSchemaPath(
            LegalPersonContactAndIdInfoResponseDto
          ),
          [CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY]: getSchemaPath(
            LegalPersonContactAndIdInfoResponseDto
          ),
        },
      },
    },
  })
  @UseGuards(AdminGuard)
  @Get('contact-and-id-info/:externalId')
  async getContactAndIdInfoByExternalId(
    @Param('externalId') externalId: string
  ): Promise<UserContactAndIdInfoResponseDto | LegalPersonContactAndIdInfoResponseDto> {
    return this.userService.getContactAndIdInfoByExternalId(externalId)
  }
}
