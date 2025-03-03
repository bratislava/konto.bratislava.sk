import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import Strategy from 'passport-headerapikey'
import { timingSafeEqual } from 'crypto'

@Injectable()
export default class AdminStrategy extends PassportStrategy(
  Strategy,
  'admin-strategy',
) {
  constructor() {
    super({ header: 'apiKey', prefix: '' }, false)
  }

  validate(apiKey: string): boolean {
    const secretKey = process.env.ADMIN_APP_SECRET as string

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
