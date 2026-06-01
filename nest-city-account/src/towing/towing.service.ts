import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { isAxiosError } from 'axios'

import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { toLogfmt } from '../utils/logging'
import { TowingSearchResponseDto } from './dtos/towing.dto'
import { TowingErrorsEnum, TowingErrorsResponseEnum } from './towing.errors.enum'

/**
 * Thin proxy around `nest-enforcement-backend`'s public towing lookup endpoint.
 *
 * The upstream endpoint (`GET /api/public/tow/:ecv`) is currently unauthenticated.
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
   * Error mapping is intentionally narrow: upstream product statuses
   * (`200`, `400`, `404`) are preserved, while transport or unexpected upstream
   * failures are translated to gateway-style statuses (`503`, `502`).
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
      })
      return data
    } catch (error) {
      if (!isAxiosError(error)) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE,
          toLogfmt({ ecv, url }),
          error
        )
      }

      if (error.response?.status === HttpStatus.NOT_FOUND) {
        throw this.throwerErrorGuard.NotFoundException(
          TowingErrorsEnum.TOWING_NOT_FOUND,
          TowingErrorsResponseEnum.TOWING_NOT_FOUND,
          toLogfmt({ ecv })
        )
      }

      if (error.response?.status === HttpStatus.BAD_REQUEST) {
        throw this.throwerErrorGuard.BadRequestException(
          TowingErrorsEnum.ENFORCEMENT_BACKEND_REJECTED_REQUEST,
          TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_REJECTED_REQUEST,
          toLogfmt({ ecv, url, status: error.response.status }),
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

      throw this.throwerErrorGuard.BadGatewayException(
        TowingErrorsEnum.ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE,
        TowingErrorsResponseEnum.ENFORCEMENT_BACKEND_UNEXPECTED_RESPONSE,
        toLogfmt({ ecv, url, status: error.response.status }),
        error
      )
    }
  }
}
