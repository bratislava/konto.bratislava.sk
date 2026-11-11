import {
  ErrorEnum,
  ErrorFactoryService,
  ErrorResponseEnum,
  LineLoggerService,
} from '@bratislava/log-nest'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AxiosError, isAxiosError } from 'axios'
import type {
  ScanFileResponseDto,
  ScanStatusDto,
} from 'openapi-clients/clamav-scanner'

import ClientsService from '../clients/clients.service'
import { ScannerClientErrorsEnum } from './scanner-client.errors.enum'

const HEALTH_CHECK_TIMEOUT_MS = 5000

@Injectable()
export default class ScannerClientService {
  constructor(
    private readonly clientsService: ClientsService,
    private errorFactoryService: ErrorFactoryService,
    private readonly logger: LineLoggerService,
  ) {}

  public async isRunning(): Promise<boolean> {
    try {
      const response =
        await this.clientsService.clamavScannerApi.appControllerIsStatusRunning(
          { timeout: HEALTH_CHECK_TIMEOUT_MS },
        )
      this.logger.debug(
        `ScannerClientService.health response.data: ${JSON.stringify(response.data)}`,
      )
      return response.data.running
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(
          this.errorFactoryService.fromAxiosError(error, {
            message: 'ScannerClientService.health error',
          }),
        )
      } else {
        this.logger.error(
          this.errorFactoryService.InternalServerErrorException({
            errorEnum: ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
            message: 'ScannerClientService.health error',
            error,
          }),
        )
      }
      return false
    }
  }

  public async scanFile(
    minioFileName: string,
    bucketUid: string,
    userUid: string | null | undefined,
  ): Promise<ScanFileResponseDto> {
    try {
      const response =
        await this.clientsService.clamavScannerApi.scannerControllerScanFile({
          // scanner needs fileUid key
          fileUid: minioFileName,
          bucketUid,
        })
      return response.data
    } catch (error) {
      if (!isAxiosError(error)) {
        throw this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: ErrorResponseEnum.INTERNAL_SERVER_ERROR,
          console: 'Error is not an instance of AxiosError',
          error,
        })
      }
      throw this.errorHandling(error, `userUid: ${userUid as string}`)
    }
  }

  public async deleteFile(scannerId: string): Promise<ScanStatusDto> {
    try {
      const response =
        await this.clientsService.clamavScannerApi.scannerControllerDeleteFileById(
          scannerId,
        )
      return response.data
    } catch (error) {
      if (!isAxiosError(error)) {
        throw this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: ErrorResponseEnum.INTERNAL_SERVER_ERROR,
          console: 'Error is not an instance of AxiosError',
          error,
        })
      }
      throw this.errorHandling(error, scannerId)
    }
  }

  private errorHandling(error: AxiosError, scannerId: string): HttpException {
    return this.errorFactoryService.fromAxiosError(error, {
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
