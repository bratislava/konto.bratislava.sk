import { Injectable } from '@nestjs/common'
import Turnstile, { TurnstileResponse } from 'cf-turnstile'

import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../../user-verification/verification.errors.enum'
import { LineLoggerSubservice } from './line-logger.subservice'

@Injectable()
export class TurnstileSubservice {
  turnstile

  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(TurnstileSubservice.name)

  constructor(private throwerErrorGuard: ThrowerErrorGuard) {
    // TODO temporarily uses dummy token which always passes
    if (!process.env.TURNSTILE_SECRET) {
      this.logger.warn('TURNSTILE_SECRET not set! Using dummy token, captcha will always pass.')
      this.turnstile = Turnstile('1x0000000000000000000000000000000AA')
    } else {
      this.turnstile = Turnstile(process.env.TURNSTILE_SECRET)
      this.logger.log('Successfully initialized Turnstile')
    }
  }

  async validateToken(token: string): Promise<void> {
    let result: TurnstileResponse | undefined
    try {
      result = await this.turnstile(token)
    } catch (error) {
      throw this.throwerErrorGuard.BadRequestException(
        VerificationErrorsEnum.INVALID_CAPTCHA,
        VerificationErrorsResponseEnum.INVALID_CAPTCHA,
        undefined,
        undefined,
        error
      )
    }
    if (!result || !result?.success) {
      throw this.throwerErrorGuard.BadRequestException(
        VerificationErrorsEnum.INVALID_CAPTCHA,
        VerificationErrorsResponseEnum.INVALID_CAPTCHA
      )
    }
  }
}
