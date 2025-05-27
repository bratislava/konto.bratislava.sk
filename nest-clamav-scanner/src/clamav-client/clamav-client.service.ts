import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileStatus } from '@prisma/client'
import * as clamd from 'clamdjs'
import { Readable as ReadableStream } from 'stream'

@Injectable()
export class ClamavClientService {
  private readonly logger: Logger
  private readonly scanner: clamd.Scanner

  //constructor with configService
  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger('ClamavClientService')

    //connection initialisation to clamav
    this.scanner = clamd.createScanner(
      configService.get('CLAMAV_HOST', ''),
      configService.get('CLAMAV_PORT', 0),
    )
  }

  async scanStream(readStream: ReadableStream) {
    //scan stream with timeout 20 minutes
    return await this.scanner.scanStream(readStream, 60000 * 20)
  }

  //function which gets clam reply
  getScanStatus(result: string): FileStatus {
    if (result.includes('OK') && !result.includes('FOUND')) {
      return FileStatus.SAFE
    }
    if (result.includes('FOUND') && !result.includes('OK')) {
      return FileStatus.INFECTED
    }
    if (result.includes('SCAN TIMEOUT')) {
      return FileStatus.SCAN_TIMEOUT
    }

    return FileStatus.SCAN_ERROR
  }

  //create function which checks if clamav scanner is running
  async isRunning() {
    try {
      return await clamd.ping(
        this.configService.get('CLAMAV_HOST', ''),
        this.configService.get('CLAMAV_PORT', 0),
      )
    } catch (error) {
      if (error instanceof Error) {
        this.logger.debug(`Clamav running error: ${error.message}`)
      } else {
        this.logger.error('Clamav running error: throwing not Error.')
      }
      return false
    }
  }

  //function which shows clamav version
  async version() {
    this.logger.debug('Checking if clamav version...')
    try {
      const version = await clamd.version(
        this.configService.get('CLAMAV_HOST', ''),
        this.configService.get('CLAMAV_PORT', 0),
        300,
      )
      this.logger.debug(`Clamav version result: ${version}`)
      return version
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Unable to check if clamav is running: ${error.message}`,
        )
      }
      throw error
    }
  }
}
