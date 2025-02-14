import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  ClamavVersionDto,
  ServiceRunningDto,
  ServicesStatusDto,
} from './status.dto';
import { StatusService } from './status.service';

@ApiTags('Statuses')
@Controller('api/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  private async getServiceStatus(
    service: () => Promise<ServiceRunningDto>,
  ): Promise<ServiceRunningDto> {
    try {
      return await service();
    } catch {
      return { running: false };
    }
  }

  private async getClamavVersion(): Promise<ClamavVersionDto> {
    try {
      return await this.statusService.clamavVersion();
    } catch {
      return { version: 'unknown' };
    }
  }

  //endpoint to return status of all services
  @ApiOperation({
    summary: 'Check all services status',
    description: 'This endpoint checks all services status',
  })
  @ApiOkResponse({
    description: 'All services status retrieved successfully',
    type: ServicesStatusDto,
  })
  @Get()
  async status(): Promise<ServicesStatusDto> {
    return {
      prisma: await this.getServiceStatus(
        async () => await this.statusService.isPrismaRunning(),
      ),
      minio: this.statusService.isMinioRunning(),
      forms: await this.getServiceStatus(
        async () => await this.statusService.isFormsRunning(),
      ),
      clamav: await this.getServiceStatus(
        async () => await this.statusService.isClamavRunning(),
      ),
      clamavVersion: await this.getClamavVersion(),
    };
  }

  //endpoint to check if prisma is running
  @ApiOperation({
    summary: 'Check prisma status',
    description: 'This endpoint checks if prisma is running',
  })
  @ApiOkResponse({
    description: 'Prisma is running',
    type: ServiceRunningDto,
  })
  @Get('prisma')
  async isPrismaRunning(): Promise<ServiceRunningDto> {
    return await this.getServiceStatus(
      async () => await this.statusService.isPrismaRunning(),
    );
  }

  //endpoint to check if minio is running
  @ApiOperation({
    summary: 'Check minio status',
    description: 'This endpoint checks if minio is running',
  })
  @ApiOkResponse({
    description: 'Minio is running',
    type: ServiceRunningDto,
  })
  @Get('minio')
  isMinioRunning(): ServiceRunningDto {
    return this.statusService.isMinioRunning();
  }

  //endpoint to check if forms backend is running
  @ApiOperation({
    summary: 'Check forms backend status',
    description: 'This endpoint checks if forms backend is running',
  })
  @ApiOkResponse({
    description: 'Forms backend is running',
    type: ServiceRunningDto,
  })
  @Get('forms')
  async isFormsRunning(): Promise<ServiceRunningDto> {
    return await this.getServiceStatus(
      async () => await this.statusService.isFormsRunning(),
    );
  }

  //endpoint to check if clamav is running
  @ApiOperation({
    summary: 'Check clamav status',
    description: 'This endpoint checks if clamav is running',
  })
  @ApiOkResponse({
    description: 'Clamav is running',
    type: ServiceRunningDto,
  })
  @Get('clamav')
  async isClamavRunning(): Promise<ServiceRunningDto> {
    return await this.getServiceStatus(
      async () => await this.statusService.isClamavRunning(),
    );
  }

  //endpoint to show clamav version
  @ApiOperation({
    summary: 'Show clamav version',
    description: 'This endpoint shows clamav version',
  })
  @ApiOkResponse({
    description: 'Clamav version retrieved',
    type: ClamavVersionDto,
  })
  @Get('clamav/version')
  async version(): Promise<ClamavVersionDto> {
    return await this.getClamavVersion();
  }
}
