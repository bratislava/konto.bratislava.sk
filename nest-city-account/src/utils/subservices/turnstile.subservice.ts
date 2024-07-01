import { Injectable } from '@nestjs/common'
import Turnstile from 'cf-turnstile'

import { ErrorThrowerGuard } from '../../utils/guards/errors.guard'
@Injectable()
export class TurnstileSubservice {
  turnstile

  constructor(private errorThrowerGuard: ErrorThrowerGuard) {
    // TODO temporarily uses dummy token which always passes
    if (!process.env.TURNSTILE_SECRET) {
      console.warn('TURNSTILE_SECRET not set! Using dummy token, captcha will always pass.')
      this.turnstile = Turnstile('1x0000000000000000000000000000000AA')
    } else {
      this.turnstile = Turnstile(process.env.TURNSTILE_SECRET)
      console.log('Successfully initialized Turnstile')
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const result = await this.turnstile(token)
      if (!result?.success) {
        this.errorThrowerGuard.invalidTurnstileCaptcha()
      }
    } catch (error) {
      console.error(error)
      this.errorThrowerGuard.invalidTurnstileCaptcha()
    }
  }
}
