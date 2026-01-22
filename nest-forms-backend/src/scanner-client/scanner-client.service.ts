import { HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Files } from '@prisma/client'
import axios, { AxiosError, AxiosResponse } from 'axios'

import { ServiceRunningDto } from '../status/dtos/status.dto'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import PostScanFileResponseDto, { GetScanFileDto } from './scanner-client.dto'
import {
  ScannerClientErrorsEnum,
  ScannerClientResponseEnum,
} from './scanner-client.errors.enum'

@Injectable()
export default class ScannerClientService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly configService: ConfigService,
    private throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice('ScannerClientService')
  }

  // create function which will check health status of forms client with axios and using forms client url NEST_FORMS_BACKEND
  public async isRunning(): Promise<boolean> {
    try {
      const url = `${<string>(
        this.configService.get('NEST_CLAMAV_SCANNER')
      )}/health`
      const response: AxiosResponse<ServiceRunningDto> = await axios.get(url, {
        timeout: 5000,
      })
      this.logger.debug(
        `ScannerClientService.health response.data: ${response.data.toString()}`,
      )
      return response.status === 200
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
          'ScannerClientService.health error',
          undefined,
          error,
        ),
      )
      return false
    }
  }

  // create function which will post array of files to scanner
  public async scanFiles(
    filesList: Files,
  ): Promise<PostScanFileResponseDto[] | undefined> {
    try {
      const url = `${<string>(
        this.configService.get<string>('NEST_CLAMAV_SCANNER')
      )}/api/scan/files`
      const response: AxiosResponse<PostScanFileResponseDto[]> =
        await axios.post(url, filesList, {
          timeout: 10_000,
          auth: {
            username:
              this.configService.get('NEST_CLAMAV_SCANNER_USERNAME') ?? '',
            password:
              this.configService.get('NEST_CLAMAV_SCANNER_PASSWORD') ?? '',
          },
        })
      this.logger.debug(
        `ScannerClientService.scanFiles response.data: ${response.data.toString()}`,
      )
      return response.data
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
        ScannerClientResponseEnum.PROBLEM_WITH_SCANNER,
        undefined,
        error,
      )
    }
  }

  public async scanFile(
    minioFileName: string,
    bucketUid: string,
    userUid: string | null | undefined,
  ): Promise<PostScanFileResponseDto | undefined> {
    const url = `${<string>(
      this.configService.get('NEST_CLAMAV_SCANNER')
    )}/api/scan/file`
    // scanner needs fileUid key
    const postData = {
      fileUid: minioFileName,
      bucketUid,
      userUid,
    }
    try {
      const response: AxiosResponse<PostScanFileResponseDto> = await axios.post(
        url,
        postData,
        {
          timeout: 10_000,
          auth: {
            username:
              this.configService.get('NEST_CLAMAV_SCANNER_USERNAME') ?? '',
            password:
              this.configService.get('NEST_CLAMAV_SCANNER_PASSWORD') ?? '',
          },
        },
      )
      return response.data
    } catch (error) {
      throw this.errorHandling(
        <AxiosError>error,
        `minioFileName: ${minioFileName}, userUid: ${<string>userUid}`,
      )
    }
  }

  public async getScanFile(
    scannerId: string,
  ): Promise<GetScanFileDto | undefined> {
    const url = `${<string>(
      this.configService.get('NEST_CLAMAV_SCANNER')
    )}/api/scan/file/${scannerId}`
    try {
      const response: AxiosResponse<GetScanFileDto> = await axios.get(url, {
        timeout: 10_000,
        auth: {
          username:
            this.configService.get('NEST_CLAMAV_SCANNER_USERNAME') ?? '',
          password:
            this.configService.get('NEST_CLAMAV_SCANNER_PASSWORD') ?? '',
        },
      })

      return response.data
    } catch (error) {
      throw this.errorHandling(<AxiosError>error, scannerId)
    }
  }

  public async deleteFile(
    scannerId: string,
  ): Promise<GetScanFileDto | undefined> {
    const url = `${<string>(
      this.configService.get('NEST_CLAMAV_SCANNER')
    )}/api/scan/file/${scannerId}`
    try {
      const response: AxiosResponse<GetScanFileDto> = await axios.delete(url, {
        timeout: 10_000,
        auth: {
          username:
            this.configService.get('NEST_CLAMAV_SCANNER_USERNAME') ?? '',
          password:
            this.configService.get('NEST_CLAMAV_SCANNER_PASSWORD') ?? '',
        },
      })

      return response.data
    } catch (error) {
      throw this.errorHandling(<AxiosError>error, scannerId)
    }
  }

  private errorHandling(error: AxiosError, scannerId: string): HttpException {
    if (error.response && error.response.status.toString().startsWith('4')) {
      if (error.response.status === 404) {
        return this.throwerErrorGuard.NotFoundException(
          ScannerClientErrorsEnum.FILE_IN_SCANNER_NOT_FOUND,
          `File  ${scannerId} was not found at the scanner: ${error.message}`,
          <string>error.response.data,
        )
      }
      if (error.response.status === 413) {
        return this.throwerErrorGuard.PayloadTooLargeException(
          ScannerClientErrorsEnum.FILE_SIZE_TOO_LARRGE,
          `File ${scannerId} is too big for scannig: ${error.message}`,
          <string>error.response.data,
        )
      }
      if (error.response.status === 410) {
        return this.throwerErrorGuard.GoneException(
          ScannerClientErrorsEnum.FILE_WAS_PROCESSED,
          `File ${scannerId} was already processed: ${error.message}`,
          <string>error.response.data,
        )
      }
      if (error.response.status === 400) {
        return this.throwerErrorGuard.BadRequestException(
          ScannerClientErrorsEnum.FILE_HAS_WRONG_PARAMETERS,
          `Params which where sent was not accepted by scanner: ${error.message}`,
          <string>error.response.data,
        )
      }
    }
    return this.throwerErrorGuard.InternalServerErrorException(
      ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
      `Error while notifying scanner backend. ScannerId if available: ${scannerId} Error: ${error.message}`,
    )
  }
}
