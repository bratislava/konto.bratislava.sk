import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ClamavClientService } from '../clamav-client/clamav-client.service'
import { FormsClientService } from '../forms-client/forms-client.service'
import { MinioClientService } from '../minio-client/minio-client.service'
import { PrismaService } from '../prisma/prisma.service'
import { ClamavVersionDto, ServiceRunningDto } from './status.dto'

@Injectable()
export class StatusService {
  private readonly logger: Logger

  constructor(
    private readonly configService: ConfigService,
    private minioClientService: MinioClientService,
    private readonly prismaService: PrismaService,
    private readonly formsClientService: FormsClientService,
    private clamavClientService: ClamavClientService,
  ) {
    this.logger = new Logger('StatusService')
  }

  //function which checks if prisma is running
  public async isPrismaRunning(): Promise<ServiceRunningDto> {
    try {
      const result = await this.prismaService.isRunning()
      return {
        running: result,
      }
    } catch (error) {
      this.logger.error(error)
      return {
        running: false,
      }
    }
  }

  //function which checks if forms is running
  public async isFormsRunning(): Promise<ServiceRunningDto> {
    try {
      const result = await this.formsClientService.isRunning()
      this.logger.log(result)
      return {
        running: true,
      }
    } catch (error) {
      this.logger.error(error)
      return {
        running: false,
      }
    }
  }

  //function which checks if minio is running
  public isMinioRunning(): ServiceRunningDto {
    try {
      const result = this.minioClientService.client()
      this.logger.log(result)
      return {
        running: true,
      }
    } catch (error) {
      this.logger.error(error)
      return {
        running: false,
      }
    }
  }

  //function which checks if clamav is running
  public async isClamavRunning(): Promise<ServiceRunningDto> {
    try {
      const result = await this.clamavClientService.isRunning()
      return {
        running: result,
      }
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }
      this.logger.error(error.message)
      return {
        running: false,
      }
    }
  }

  //function which checks clamav version
  public async clamavVersion(): Promise<ClamavVersionDto> {
    try {
      const result = await this.clamavClientService.version()
      return {
        version: result,
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message)
      }
      throw error
    }
  }
}
