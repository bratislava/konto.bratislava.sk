import { Injectable } from '@nestjs/common'

import PrismaService from '../prisma/prisma.service'
import ScannerClientService from '../scanner-client/scanner-client.service'
import alertError, {
  LineLoggerSubservice,
} from '../utils/subservices/line-logger.subservice'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import { ServiceRunningDto } from './dtos/status.dto'

@Injectable()
export default class StatusService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private minioClientSubservice: MinioClientSubservice,
    private readonly prismaService: PrismaService,
    private readonly scannerClientService: ScannerClientService,
  ) {
    this.logger = new LineLoggerSubservice('StatusService')
  }

  // function which checks if prisma is running
  public async isPrismaRunning(): Promise<ServiceRunningDto> {
    try {
      const result = await this.prismaService.isRunning()
      return {
        running: result,
      }
    } catch (error) {
      alertError('Prisma is not running.', this.logger, error)
      return {
        running: false,
      }
    }
  }

  // function which checks if forms is running
  public async isScannerRunning(): Promise<ServiceRunningDto> {
    try {
      const result = await this.scannerClientService.isRunning()
      this.logger.log(result)
      return {
        running: true,
      }
    } catch (error) {
      alertError('Scanner is not running.', this.logger, error)
      return {
        running: false,
      }
    }
  }

  // function which checks if minio is running
  public async isMinioRunning(): Promise<ServiceRunningDto> {
    try {
      const result = this.minioClientSubservice.client()
      this.logger.log(result)
      return {
        running: true,
      }
    } catch (error) {
      alertError('Minio is not running.', this.logger, error)
      return {
        running: false,
      }
    }
  }
}
