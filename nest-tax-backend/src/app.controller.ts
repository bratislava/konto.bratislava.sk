import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Controller()
@ApiTags('default')
export class AppController {
  @ApiOperation({
    summary: 'Healthcheck',
    description: 'See if nest is working!',
  })
  @ApiResponse({
    status: 200,
    description: 'Everything is working',
  })
  @Get('healthcheck')
  // eslint-disable-next-line lodash-fp/prefer-constant
  health(): string {
    return 'OK'
  }
}
