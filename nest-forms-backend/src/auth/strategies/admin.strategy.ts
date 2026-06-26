import { timingSafeEqual } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import Strategy from 'passport-headerapikey'

import BaConfigService from '../../config/ba-config.service'

@Injectable()
export default class AdminStrategy extends PassportStrategy(
  Strategy,
  'admin-strategy',
) {
  constructor(private readonly baConfigService: BaConfigService) {
    super({ header: 'apiKey', prefix: '' }, false)
  }

  validate(apiKey: string): boolean {
    const secretKey = this.baConfigService.tokens.adminAppSecret

    if (apiKey.length !== secretKey.length) {
      return false
    }

    try {
      const apiKeyBuffer = Buffer.from(apiKey)
      const secretBuffer = Buffer.from(secretKey)

      return timingSafeEqual(apiKeyBuffer, secretBuffer)
    } catch {
      return false
    }
  }
}
