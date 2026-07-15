import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'

import BaConfigService from '../../config/ba-config.service'
import { timingSafeStringEqual } from '../../utils/crypto'

@Injectable()
export class AdminStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'admin-strategy') {
  constructor(private readonly baConfigService: BaConfigService) {
    super({ header: 'apiKey', prefix: '' }, false)
  }

  validate(apiKey: string): boolean {
    const secretKey = this.baConfigService.tokens.adminAppSecret

    return timingSafeStringEqual(secretKey, apiKey)
  }
}
