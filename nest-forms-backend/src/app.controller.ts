import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import AppService from './app.service'

@Controller()
@ApiTags('Healthcheck')
export default class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Hello world!',
    description: 'See if nest is working!',
  })
  @Get('healthcheck')
  @ApiResponse({
    status: 200,
    description: '',
    type: 'string',
  })
  getHello(): string {
    return this.appService.getHello()
  }
}
