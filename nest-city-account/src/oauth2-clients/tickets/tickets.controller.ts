import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { ClientName } from '../../oauth2/decorators/client-name.decorator'
import { OAuth2AccessGuard } from '../../oauth2/guards/oauth2-access.guard'
import { OAuth2ClientName } from '../../oauth2/oauth2-client-name.enum'
import { User } from '../../utils/decorators/request.decorator'
import { CognitoGetUserData, CognitoUserAttributesEnum } from '../../utils/global-dtos/cognito.dto'
import { TicketsUserDto } from './dtos/user.dto'

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  @Get('userdata')
  @ClientName(OAuth2ClientName.TICKETS)
  @UseGuards(OAuth2AccessGuard)
  @ApiOperation({
    summary: 'Get user data',
    description: 'Returns user data for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User data retrieved successfully',
    type: TicketsUserDto,
  })
  userData(@User() user: CognitoGetUserData): TicketsUserDto {
    return {
      id: user.idUser || user.sub,
      email: user.email,
      emailVerified: user.email_verified,
      accountType: user['custom:account_type'],
      name: user.name,
      firstName: user.given_name,
      lastName: user.family_name,
      verificationState: user[CognitoUserAttributesEnum.TIER],
    }
  }
}
