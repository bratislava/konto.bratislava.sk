import * as crypto from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'

@Injectable()
export class AdminStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'admin-strategy',
) {
  constructor(private readonly configService: ConfigService) {
    super(
      { header: 'apiKey', prefix: '' },
      false,
      (
        apiKey: string,
        done: (err: Error | null, user?: Object, info?: Object) => void,
      ) => {
        const isMatch = crypto.timingSafeEqual(
          Buffer.from(apiKey),
          Buffer.from(
            this.configService.getOrThrow<string>('ADMIN_APP_SECRET'),
          ),
        )
        if (isMatch) {
          return done(null, true)
        }
        return done(null, false)
      },
    )
  }
}
