import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'

import { timingSafeStringEqual } from '../../utils/crypto'

@Injectable()
export class AdminStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'admin-strategy') {
  constructor(private readonly configService: ConfigService) {
    super({ header: 'apiKey', prefix: '' }, false)
  }

  validate(apiKey: string): boolean {
    const secretKey = this.configService.getOrThrow<string>('ADMIN_APP_SECRET')

    return timingSafeStringEqual(secretKey, apiKey)
  }
}
