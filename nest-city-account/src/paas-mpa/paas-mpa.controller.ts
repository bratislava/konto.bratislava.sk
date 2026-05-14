import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { ClientName } from '../oauth2/decorators/client-name.decorator'
import { OAuth2AccessGuard } from '../oauth2/guards/oauth2-access.guard'
import { OAuth2ClientName } from '../oauth2/subservices/oauth2-client.subservice'
import { User } from '../utils/decorators/request.decorator'
import { CognitoGetUserData } from '../utils/global-dtos/cognito.dto'
import { PaasMpaRegisterRequestDto, PaasMpaRegisterResponseDto } from './dtos/paas-mpa.dto'
import { PaasMpaService } from './paas-mpa.service'

@ApiTags('PAAS-MPA')
@ApiBearerAuth()
@Controller('paas-mpa')
export class PaasMpaController {
  constructor(private readonly paasMpaService: PaasMpaService) {}

  @Post('register')
  @ClientName(OAuth2ClientName.PAAS_MPA)
  @UseGuards(OAuth2AccessGuard)
  @ApiOperation({
    summary: 'Register phone number for a verified user in Bloomreach',
    description:
      'Accepts phone number from PAAS-MPA, registers phone number for a verified user in Bloomreach, and returns Bloomreach hard ID (`contact_id`).',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns registration result and verification state',
    type: PaasMpaRegisterResponseDto,
  })
  async register(
    @User() user: CognitoGetUserData,
    @Body() body: PaasMpaRegisterRequestDto
  ): Promise<PaasMpaRegisterResponseDto> {
    return await this.paasMpaService.registerPhoneAndGetContactId(user, body.phoneNumber)
  }
}
