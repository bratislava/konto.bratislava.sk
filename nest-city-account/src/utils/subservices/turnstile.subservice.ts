import { Injectable } from '@nestjs/common'
import Turnstile, { TurnstileResponse } from 'cf-turnstile'

import BaConfigService from '../../config/ba-config.service'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../../user-verification/verification.errors.enum'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { LineLoggerSubservice } from './line-logger.subservice'

/**
 * Cloudflare's documented "always passes" Turnstile test secret
 * (https://developers.cloudflare.com/turnstile/troubleshooting/testing/). Set
 * TURNSTILE_SECRET to this value to make captcha validation always succeed
 * (e.g. for local development) - there is no implicit fallback, so the env var
 * must explicitly hold either this value or a real secret.
 */
const DUMMY_TURNSTILE_SECRET = '1x0000000000000000000000000000000AA'

@Injectable()
export class TurnstileSubservice {
  turnstile

  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(TurnstileSubservice.name)

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    baConfigService: BaConfigService
  ) {
    const { turnstileSecret } = baConfigService.security
    this.turnstile = Turnstile(turnstileSecret)
    if (turnstileSecret === DUMMY_TURNSTILE_SECRET) {
      this.logger.warn('TURNSTILE_SECRET is set to the dummy value, captcha will always pass.')
    } else {
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
