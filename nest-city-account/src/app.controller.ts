import { Controller, Get } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

@Controller()
export class AppController {
  @ApiOperation({
    summary: 'HealthCheck',
    description: 'See if app is working!',
  })
  @Get('healthcheck')
  healthCheck(): 'OK' {
    return 'OK'
  }
}
