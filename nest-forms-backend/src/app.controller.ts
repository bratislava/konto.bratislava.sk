import { LogAllowList } from '@bratislava/log-nest'
import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import AppService from './app.service'

@Controller()
@ApiTags('Healthcheck')
export default class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Hello world!',
    description: 'See if nest is working!',
  })
  @LogAllowList(true)
  @Get('healthcheck')
  @ApiOkResponse({
    description: '',
    type: 'string',
  })
  getHello(): string {
    return this.appService.getHello()
  }
}
