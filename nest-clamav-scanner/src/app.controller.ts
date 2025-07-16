import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { AppService } from './app.service'
import { ServiceRunningDto } from './status/status.dto'

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  //status endpoint to return if this servise is running
  @ApiOperation({
    summary: 'Check status of this service',
    description: 'This endpoint checks if this service is running',
  })
  @ApiOkResponse({
    description: 'Service running status',
    type: ServiceRunningDto,
  })
  @Get('health')
  isStatusRunning(): ServiceRunningDto {
    return {
      running: true,
    }
  }

  @ApiOperation({
    summary: 'Hello world!',
    description: 'See if nest is working!',
  })
  @ApiOkResponse({
    description: 'Returns a hello message',
    type: String,
  })
  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}
