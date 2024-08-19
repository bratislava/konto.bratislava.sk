import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClamavVersionDto, ServiceRunningDto } from './status.dto';
import { StatusService } from './status.service';

@ApiTags('Statuses')
@Controller('api/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  //endpoint to return status of all services
  @ApiOperation({
    summary: 'Check all services status',
    description: 'This endpoint checks all services status',
  })
  @Get()
  async status(): Promise<any> {
    const prisma = await this.statusService.isPrismaRunning();
    const minio = await this.statusService.isMinioRunning();
    const forms = await this.statusService.isFormsRunning();
    const clamav = await this.statusService.isClamavRunning();
    const clamavVersion = await this.statusService.clamavVersion();
    return {
      prisma: prisma,
      minio: minio,
      forms: forms,
      clamav: clamav,
      clamavVersion: clamavVersion,
    };
  }

  //endpoint to check if prisma is running
  @ApiOperation({
    summary: 'Check prisma status',
    description: 'This endpoint checks if prisma is running',
  })
  @Get('prisma')
  isPrismaRunning(): Promise<ServiceRunningDto> {
    return this.statusService.isPrismaRunning();
  }

  //endpoint to check if minio is running
  @ApiOperation({
    summary: 'Check minio status',
    description: 'This endpoint checks if minio is running',
  })
  @Get('minio')
  isMinioRunning(): Promise<ServiceRunningDto> {
    return this.statusService.isMinioRunning();
  }

  //endpoint to check if forms backend is running
  @ApiOperation({
    summary: 'Check forms backend status',
    description: 'This endpoint checks if forms backend is running',
  })
  @Get('forms')
  isFormsRunning(): Promise<ServiceRunningDto> {
    return this.statusService.isFormsRunning();
  }

  //endpoint to check if clamav is running
  @ApiOperation({
    summary: 'Check clamav status',
    description: 'This endpoint checks if clamav is running',
  })
  @Get('clamav')
  isClamavRunning(): Promise<ServiceRunningDto> {
    return this.statusService.isClamavRunning();
  }

  //endpoint to show clamav version
  @ApiOperation({
    summary: 'Show clamav version',
    description: 'This endpoint shows clamav version',
  })
  @Get('clamav/version')
  version(): Promise<ClamavVersionDto> {
    return this.statusService.clamavVersion();
  }
}
