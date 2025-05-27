import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { User } from '../utils/decorators/request.decorator'
import { CognitoGetUserData } from '../utils/global-dtos/cognito.dto'
import { CognitoGuard } from './guards/cognito.guard'

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  @HttpCode(200)
  @ApiOperation({
    summary: 'Check if user is authorized',
  })
  @ApiResponse({
    status: 200,
    description: 'Return data from cognito',
    type: CognitoGetUserData,
  })
  @UseGuards(CognitoGuard)
  @Get('user')
  login(@User() user: CognitoGetUserData): CognitoGetUserData {
    return user
  }
}
