import { timingSafeEqual } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'

@Injectable()
export class AdminStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'admin-strategy') {
  constructor(private readonly configService: ConfigService) {
    super({ header: 'apiKey', prefix: '' }, false)
  }

  validate(apiKey: string): boolean {
    const secretKey = this.configService.getOrThrow<string>('ADMIN_APP_SECRET')

    if (apiKey.length !== secretKey.length) {
      return false
    }

    try {
      const apiKeyBuffer = Buffer.from(apiKey)
      const secretBuffer = Buffer.from(secretKey)

      return timingSafeEqual(apiKeyBuffer, secretBuffer)
    } catch (error) {
      return false
    }
  }
}
