import { Injectable } from '@nestjs/common'
import Turnstile, { TurnstileResponse } from 'cf-turnstile'

import BaConfigService from '../../config/ba-config.service'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../../user-verification/verification.errors.enum'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { LineLoggerSubservice } from './line-logger.subservice'

@Injectable()
export class TurnstileSubservice {
  turnstile

  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(TurnstileSubservice.name)

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    baConfigService: BaConfigService
  ) {
    // TODO temporarily uses dummy token which always passes
    const { turnstileSecret } = baConfigService.security
    if (!turnstileSecret) {
      this.logger.warn('TURNSTILE_SECRET not set! Using dummy token, captcha will always pass.')
      this.turnstile = Turnstile('1x0000000000000000000000000000000AA')
    } else {
      this.turnstile = Turnstile(turnstileSecret)
      this.logger.log('Successfully initialized Turnstile')
    }
  }

  async validateToken(token: string): Promise<void> {
    let result: TurnstileResponse
    try {
      result = await this.turnstile(token)
    } catch (error) {
      throw this.throwerErrorGuard.BadRequestException(
        VerificationErrorsEnum.INVALID_CAPTCHA,
        VerificationErrorsResponseEnum.INVALID_CAPTCHA,
        undefined,
        error
      )
    }
    if (!result.success) {
      throw this.throwerErrorGuard.BadRequestException(
        VerificationErrorsEnum.INVALID_CAPTCHA,
        VerificationErrorsResponseEnum.INVALID_CAPTCHA
      )
    }
  }
}
