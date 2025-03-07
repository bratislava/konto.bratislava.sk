import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { BasicStrategy as Strategy } from 'passport-http'

import { BaConfig } from '../../config/baConfig'

@Injectable()
export default class BasicStrategy extends PassportStrategy(
  Strategy,
  'auth-basic',
) {
  constructor(private readonly baConfig: BaConfig) {
    super({
      passReqToCallback: true,
    })
  }

  public validate = async (
    _: unknown,
    username: string,
    password: string,
  ): Promise<boolean> => {
    if (
      this.baConfig.formsBackend.username === username &&
      this.baConfig.formsBackend.password === password
    ) {
      return true
    }
    throw new UnauthorizedException()
  }
}
