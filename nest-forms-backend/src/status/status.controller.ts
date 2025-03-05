import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { ServiceRunningDto } from './dtos/status.dto'
import StatusResponseDto from './dtos/status.response.dto'
import StatusService from './status.service'

@ApiTags('Statuses')
@Controller('status')
export default class StatusController {
  constructor(private readonly statusService: StatusService) {}

  // endpoint to return status of all services
  @ApiOperation({
    summary: 'Check all services status',
    description: 'This endpoint checks all services status',
  })
  @ApiOkResponse({
    description: 'Status of prisma, minio and scanner services.',
    type: StatusResponseDto,
  })
  @Get()
  async status(): Promise<StatusResponseDto> {
    const prisma = await this.statusService.isPrismaRunning()
    const minio = await this.statusService.isMinioRunning()
    const scanner = await this.statusService.isScannerRunning()
    return {
      prisma,
      minio,
      scanner,
    }
  }

  // endpoint to check if prisma is running
  @ApiOperation({
    summary: 'Check prisma status',
    description: 'This endpoint checks if prisma is running',
  })
  @ApiOkResponse({
    description: 'Status of prisma.',
    type: ServiceRunningDto,
  })
  @Get('prisma')
  isPrismaRunning(): Promise<ServiceRunningDto> {
    return this.statusService.isPrismaRunning()
  }

  // endpoint to check if minio is running
  @ApiOperation({
    summary: 'Check minio status',
    description: 'This endpoint checks if minio is running',
  })
  @ApiOkResponse({
    description: 'Status of minio.',
    type: ServiceRunningDto,
  })
  @Get('minio')
  isMinioRunning(): Promise<ServiceRunningDto> {
    return this.statusService.isMinioRunning()
  }

  @ApiOperation({
    summary: 'Check scanner backend status',
    description: 'This endpoint checks if forms backend is running',
  })
  @ApiOkResponse({
    description: 'Status of scanner.',
    type: ServiceRunningDto,
  })
  @Get('scanner')
  isFormsRunning(): Promise<ServiceRunningDto> {
    return this.statusService.isScannerRunning()
  }
}
