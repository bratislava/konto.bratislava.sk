import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'

@Injectable()
export default class AdminStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'admin-strategy',
) {
  constructor() {
    super(
      { header: 'apiKey', prefix: '' },
      false,
      (
        apiKey: string | undefined,
        done: (a: unknown, b?: unknown) => unknown,
      ) => {
        // We are not doing simple apiKey === ADMIN_APP_SECRET because of timing attacks
        if (!apiKey || apiKey.length !== process.env.ADMIN_APP_SECRET?.length) {
          return done(false)
        }

        let pass = true
        for (let i = 0; i < apiKey.length; i += 1) {
          if (apiKey.charAt(i) !== process.env.ADMIN_APP_SECRET?.charAt(i)) {
            pass = false
          }
        }
        if (pass) {
          return done(null, true)
        }
        return done(false)
      },
    )
  }
}
