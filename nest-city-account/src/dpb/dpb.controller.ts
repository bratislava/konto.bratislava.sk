import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { OAuth2AccessGuard } from '../oauth2/guards/oauth2-access.guard'
import { ClientName } from '../oauth2/decorators/client-name.decorator'
import { OAuth2ClientName } from '../oauth2/subservices/oauth2-client.subservice'
import { User } from '../utils/decorators/request.decorator'
import { CognitoGetUserData } from '../utils/global-dtos/cognito.dto'
import { DpbUserDto } from './dtos/user.dto'

@ApiTags('DPB')
@ApiBearerAuth()
@Controller('dpb')
export class DpbController {
  @Get('userdata')
  @ClientName(OAuth2ClientName.DPB)
  @UseGuards(OAuth2AccessGuard)
  @ApiOperation({
    summary: 'Get user data',
    description: 'Returns user data for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User data retrieved successfully',
    type: DpbUserDto,
  })
  userData(@User() user: CognitoGetUserData): DpbUserDto {
    return {
      id: user.idUser || user.sub,
      email: user.email,
      email_verified: user.email_verified,
      account_type: user['custom:account_type'],
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
    }
  }
}
