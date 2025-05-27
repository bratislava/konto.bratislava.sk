import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { BasicStrategy as Strategy } from 'passport-http'

@Injectable()
export default class BasicStrategy extends PassportStrategy(
  Strategy,
  'auth-basic',
) {
  constructor(private readonly configService: ConfigService) {
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
      this.configService.get<string>('NEST_FORMS_BACKEND_USERNAME') ===
        username &&
      this.configService.get<string>('NEST_FORMS_BACKEND_PASSWORD') === password
    ) {
      return true
    }
    throw new UnauthorizedException()
  }
}
