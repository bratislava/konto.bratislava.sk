import { AllowList } from '@bratislava/log-nest'
import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@Controller()
@AllowList(true)
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
  health(): string {
    return 'OK'
  }
}
