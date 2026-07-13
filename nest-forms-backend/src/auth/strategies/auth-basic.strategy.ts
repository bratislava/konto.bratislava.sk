import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { BasicStrategy as Strategy } from 'passport-http'

import BaConfigService from '../../config/ba-config.service'
import { timingSafeStringEqual } from '../../utils/crypto'

@Injectable()
export default class BasicStrategy extends PassportStrategy(
  Strategy,
  'auth-basic',
) {
  constructor(private readonly baConfigService: BaConfigService) {
    super({
      passReqToCallback: true,
    })
  }

  public validate = (
    _: unknown,
    username: string,
    password: string,
  ): boolean => {
    // Evaluate both comparisons before combining so we don't short-circuit and
    // leak (via timing) which field was wrong.
    const usernameMatch = timingSafeStringEqual(
      this.baConfigService.self.username,
      username,
    )
    const passwordMatch = timingSafeStringEqual(
      this.baConfigService.self.password,
      password,
    )

    if (usernameMatch && passwordMatch) {
      return true
    }
    throw new UnauthorizedException()
  }
}
