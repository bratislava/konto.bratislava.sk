import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { BasicStrategy as Strategy } from 'passport-http'

import { timingSafeStringEqual } from '../../utils/crypto'

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'auth-basic') {
  constructor(private readonly configService: ConfigService) {
    super({
      passReqToCallback: true,
    })
  }

  public validate = (
    req: unknown,
    username: string,
    password: string,
  ): boolean => {
    // Evaluate both comparisons before combining so we don't short-circuit and
    // leak (via timing) which field was wrong.
    const usernameMatch = timingSafeStringEqual(
      this.configService.get<string>('NEST_CLAMAV_SCANNER_USERNAME'),
      username,
    )
    const passwordMatch = timingSafeStringEqual(
      this.configService.get<string>('NEST_CLAMAV_SCANNER_PASSWORD'),
      password,
    )

    if (usernameMatch && passwordMatch) {
      return true
    }
    throw new UnauthorizedException()
  }
}
