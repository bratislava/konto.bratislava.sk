import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation } from '@nestjs/swagger';
import { ServiceRunningDto } from './status/status.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  //status endpoint to return if this servise is running
  @ApiOperation({
    summary: 'Check status of this service',
    description: 'This endpoint checks if this service is running',
  })
  @Get('health')
  async isStatusRunning(): Promise<ServiceRunningDto> {
    return {
      running: true,
    };
  }

  @ApiOperation({
    summary: 'Hello world!',
    description: 'See if nest is working!',
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
