import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger'

import { AdminGuard } from '../auth/guards/admin.guard'
import { CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'
import {
  LegalPersonContactAndIdInfoDto,
  UserContactAndIdInfoDto,
} from './dtos/user-contact-info.dto'
import { UserService } from './user.service'

@ApiTags('User integration')
@ApiSecurity('apiKey')
@ApiExtraModels(UserContactAndIdInfoDto, LegalPersonContactAndIdInfoDto)
@Controller('user-integration')
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
        { $ref: getSchemaPath(UserContactAndIdInfoDto) },
        { $ref: getSchemaPath(LegalPersonContactAndIdInfoDto) },
      ],
      discriminator: {
        propertyName: 'accountType',
        mapping: {
          [CognitoUserAccountTypesEnum.PHYSICAL_ENTITY]: getSchemaPath(UserContactAndIdInfoDto),
          [CognitoUserAccountTypesEnum.LEGAL_ENTITY]: getSchemaPath(LegalPersonContactAndIdInfoDto),
          [CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY]: getSchemaPath(
            LegalPersonContactAndIdInfoDto
          ),
        },
      },
    },
  })
  @UseGuards(AdminGuard)
  @Get('contact-and-id-info/:externalId')
  async getContactAndIdInfoByExternalId(
    @Param('externalId') externalId: string
  ): Promise<UserContactAndIdInfoDto | LegalPersonContactAndIdInfoDto> {
    return this.userService.getContactAndIdInfoByExternalId(externalId)
  }
}
