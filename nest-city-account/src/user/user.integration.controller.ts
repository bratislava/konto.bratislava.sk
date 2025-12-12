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
  LegalPersonContactAndIdInfoResponseDto,
  UserContactAndIdInfoResponseDto,
} from './dtos/user-contact-info.dto'
import { UserService } from './user.service'

@ApiTags('User integration')
@ApiSecurity('apiKey')
@ApiExtraModels(UserContactAndIdInfoResponseDto, LegalPersonContactAndIdInfoResponseDto)
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
