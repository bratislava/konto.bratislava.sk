import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Files } from '@prisma/client'
import axios, { AxiosError, AxiosResponse, isAxiosError } from 'axios'

import { ServiceRunningDto } from '../status/dtos/status.dto'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../utils/global-enums/errors.enum'
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
      const url = `${this.configService.get<string>('NEST_CLAMAV_SCANNER')}/health`
      const response: AxiosResponse<ServiceRunningDto> = await axios.get(url, {
        timeout: 5000,
      })
      this.logger.debug(
        `ScannerClientService.health response.data: ${JSON.stringify(response.data)}`,
      )
      return response.status === 200
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(
          this.throwerErrorGuard.fromAxiosError(error, {
            message: 'ScannerClientService.health error',
          }),
        )
      } else {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
            'ScannerClientService.health error',
            undefined,
            error,
          ),
        )
      }
      return false
    }
  }

  // create function which will post array of files to scanner
  public async scanFiles(
    filesList: Files,
  ): Promise<PostScanFileResponseDto[] | undefined> {
    try {
      const url = `${this.configService.get<string>('NEST_CLAMAV_SCANNER')}/api/scan/files`
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
        `ScannerClientService.scanFiles response.data: ${JSON.stringify(response.data)}`,
      )
      return response.data
    } catch (error) {
      if (!isAxiosError(error)) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
          ScannerClientResponseEnum.PROBLEM_WITH_SCANNER,
          undefined,
          error,
        )
      }
      throw this.throwerErrorGuard.fromAxiosError(error, {
        errorEnumOverwrite: ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
        message: ScannerClientResponseEnum.PROBLEM_WITH_SCANNER,
      })
    }
  }

  public async scanFile(
    minioFileName: string,
    bucketUid: string,
    userUid: string | null | undefined,
  ): Promise<PostScanFileResponseDto | undefined> {
    const url = `${this.configService.get<string>('NEST_CLAMAV_SCANNER')}/api/scan/file`
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
      if (!isAxiosError(error)) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
          'Error is not an instance of AxiosError',
          error,
        )
      }
      throw this.errorHandling(
        error,
        `minioFileName: ${minioFileName}, userUid: ${userUid as string}`,
      )
    }
  }

  public async getScanFile(
    scannerId: string,
  ): Promise<GetScanFileDto | undefined> {
    const url = `${this.configService.get<string>('NEST_CLAMAV_SCANNER')}/api/scan/file/${scannerId}`
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
      if (!isAxiosError(error)) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
          'Error is not an instance of AxiosError',
          error,
        )
      }
      throw this.errorHandling(error, scannerId)
    }
  }

  public async deleteFile(
    scannerId: string,
  ): Promise<GetScanFileDto | undefined> {
    const url = `${this.configService.get<string>('NEST_CLAMAV_SCANNER')}/api/scan/file/${scannerId}`
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
      if (!isAxiosError(error)) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
          'Error is not an instance of AxiosError',
          error,
        )
      }
      throw this.errorHandling(error, scannerId)
    }
  }

  private errorHandling(error: AxiosError, scannerId: string): HttpException {
    return this.throwerErrorGuard.fromAxiosError(error, {
      message: `Error while notifying scanner backend. ScannerId if available: ${scannerId} Error: ${error.message}`,
      console: error.response?.data as string | undefined,
      statusOverrides: {
        [HttpStatus.NOT_FOUND]: {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errorEnum: ScannerClientErrorsEnum.FILE_IN_SCANNER_NOT_FOUND,
          message: `File  ${scannerId} was not found at the scanner: ${error.message}`,
        },
        [HttpStatus.PAYLOAD_TOO_LARGE]: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errorEnum: ScannerClientErrorsEnum.FILE_SIZE_TOO_LARRGE,
          message: `File ${scannerId} is too big for scannig: ${error.message}`,
        },
        [HttpStatus.GONE]: {
          status: HttpStatus.ALREADY_REPORTED,
          errorEnum: ScannerClientErrorsEnum.FILE_WAS_PROCESSED,
          message: `File ${scannerId} was already processed: ${error.message}`,
        },
        [HttpStatus.BAD_REQUEST]: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errorEnum: ScannerClientErrorsEnum.FILE_HAS_WRONG_PARAMETERS,
          message: `Params which where sent was not accepted by scanner: ${error.message}`,
        },
      },
    })
  }
}
