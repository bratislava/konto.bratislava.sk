import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'

@Injectable()
export class AdminStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'admin-strategy',
) {
  constructor() {
    super({ header: 'apiKey', prefix: '' }, false, (apiKey, done) => {
      if (apiKey === process.env.ADMIN_APP_SECRET) {
        return done(null, true)
      }
      return done(false)
    })
  }
}
