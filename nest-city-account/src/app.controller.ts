import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller()
@ApiTags('default')
export class AppController {
  @ApiOperation({
    summary: 'HealthCheck',
    description: 'See if app is working!',
  })
  @ApiOkResponse({
    description: 'Everything is working',
    type: String,
  })
  @Get('healthcheck')
  healthCheck(): 'OK' {
    return 'OK'
  }
}
