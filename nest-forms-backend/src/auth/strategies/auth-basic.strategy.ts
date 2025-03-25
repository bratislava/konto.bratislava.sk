import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { BasicStrategy as Strategy } from 'passport-http'

import BaConfigService from '../../config/ba-config.service'

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

  public validate = async (
    _: unknown,
    username: string,
    password: string,
  ): Promise<boolean> => {
    if (
      this.baConfigService.self.username === username &&
      this.baConfigService.self.password === password
    ) {
      return true
    }
    throw new UnauthorizedException()
  }
}
