import { Injectable, Logger } from '@nestjs/common'
import * as clamd from 'clamdjs'
import { Readable as ReadableStream } from 'stream'

import BaConfigService from '../config/ba-config.service'
import { FileStatus } from '../generated/prisma/client'

// Encrypted files (AlertEncryptedArchive) and files over the scan limits
// (AlertExceedsMax) are reported as heuristic detections, they are not allowed
// but not infected either
const REJECTED_DETECTIONS = /Heuristics\.(Encrypted|Limits\.Exceeded)\./

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
    // The reply format is only defined by the clamd source: "<name>: OK", "<name>: <detection> FOUND" and
    // "<name>: <message> ERROR" (clamd/scanner.c, clamd/session.c), with a null terminator for zINSTREAM
    const reply = result.replaceAll('\0', '').trim()
    if (reply.endsWith(': OK')) {
      return FileStatus.SAFE
    }
    const detection = /: (.+) FOUND$/.exec(reply)?.[1]
    if (detection !== undefined) {
      return REJECTED_DETECTIONS.test(detection)
        ? FileStatus.REJECTED
        : FileStatus.INFECTED
    }
    if (result.includes(FileStatus.SCAN_TIMEOUT)) {
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
