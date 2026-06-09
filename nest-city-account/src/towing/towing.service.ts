import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { isAxiosError } from 'axios'

import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { toLogfmt } from '../utils/logging'
import { TowingSearchResponseDto } from './dtos/towing.dto'
import { TowingErrorsEnum, TowingErrorsResponseEnum } from './towing.errors.enum'

/**
 * Thin proxy around `nest-enforcement-backend`'s public towing lookup endpoint.
 *
 * The upstream endpoint (`GET /api/public/tow/:ecv`) is protected by API key.
 * This service exposes it through `nest-city-account` and keeps room for
 * local protections (for example Turnstile, rate limiting, or additional logging).
 */
@Injectable()
export class TowingService {
  private readonly enforcementBackendUrl: string

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.enforcementBackendUrl = this.configService.getOrThrow<string>('ENFORCEMENT_BACKEND_URL')
  }

  /**
   * Look up the public towing activity report for the given license plate.
   *
   * Returns the upstream payload. The upstream contract is captured by
   * {@link TowingSearchResponseDto} - keep them in sync.
   *
   * Error mapping preserves product statuses (`200`, `400`, `404`) and uses
   * the shared downstream Axios mapper for all other downstream HTTP failures.
   * Transport failures with no downstream response are mapped to `503`.
   *
   * @param ecv License plate to search for (forwarded to upstream)
   * @throws NotFoundException (404) when no active towing or relocation exists
   * @throws BadRequestException (400) when upstream rejects the request
   * @throws ServiceUnavailableException (503) when upstream is unreachable
   * @throws BadGatewayException (502) when upstream returns an unexpected status
   * @throws InternalServerErrorException (500) on internal proxy failures
   */
  async getPublicTowingByEcv(ecv: string): Promise<TowingSearchResponseDto> {
    const url = `${this.enforcementBackendUrl}/api/public/tow/${encodeURIComponent(ecv)}`

    try {
      const { data } = await axios.get<TowingSearchResponseDto>(url, {
        timeout: 10_000,
        headers: {
          'X-Api-Key': this.configService.getOrThrow<string>('ENFORCEMENT_BACKEND_TOW_API_KEY'),
        },
      })
      return data
    } catch (error) {
      if (!isAxiosError(error)) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
          toLogfmt({ ecv, url }),
          error
        )
      }

      if (!error.response) {
        throw this.throwerErrorGuard.ServiceUnavailableException(
          TowingErrorsEnum.ENFORCEMENT_BACKEND_UNAVAILABLE,
          TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_UNAVAILABLE,
          toLogfmt({ ecv, url, code: error.code }),
          error
        )
      }

      throw this.throwerErrorGuard.fromAxiosError(error, {
        message: TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE,
        console: toLogfmt({ ecv, url, status: error.response.status }),
        statusOverrides: {
          [HttpStatus.NOT_FOUND]: {
            status: HttpStatus.NOT_FOUND,
            errorEnum: TowingErrorsEnum.TOWING_NOT_FOUND,
            message: TowingErrorsResponseEnum.TOWING_NOT_FOUND,
          },
          [HttpStatus.BAD_REQUEST]: {
            status: HttpStatus.BAD_REQUEST,
            errorEnum: TowingErrorsEnum.ENFORCEMENT_BACKEND_REJECTED_REQUEST,
            message: TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_REJECTED_REQUEST,
          },
          [HttpStatus.SERVICE_UNAVAILABLE]: {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            errorEnum: TowingErrorsEnum.ENFORCEMENT_BACKEND_UNAVAILABLE,
            message: TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_UNAVAILABLE,
          },
        },
      })
    }
  }
}
