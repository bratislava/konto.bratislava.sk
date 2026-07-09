import { Injectable, Logger } from '@nestjs/common'
import * as clamd from 'clamdjs'
import { Readable as ReadableStream } from 'stream'

import BaConfigService from '../config/ba-config.service'
import { FileStatus } from '../generated/prisma/client'

@Injectable()
export class ClamavClientService {
  private readonly logger: Logger
  private readonly scanner: clamd.Scanner

  constructor(private readonly baConfigService: BaConfigService) {
    this.logger = new Logger('ClamavClientService')

    //connection initialization to clamav
    this.scanner = clamd.createScanner(
      baConfigService.clamav.host,
      baConfigService.clamav.port,
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
        this.baConfigService.clamav.host,
        this.baConfigService.clamav.port,
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
        this.baConfigService.clamav.host,
        this.baConfigService.clamav.port,
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
