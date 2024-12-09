import { Controller, HttpCode, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { User } from '../utils/decorators/request.decorator'
import { CognitoGetUserData } from '../utils/global-dtos/cognito.dto'

@ApiTags('Auth')
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
  @Post('todo')
  login(@User() user: CognitoGetUserData): CognitoGetUserData {
    return user
  }
}
