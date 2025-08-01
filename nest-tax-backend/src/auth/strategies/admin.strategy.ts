import { timingSafeEqual } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'

import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

@Injectable()
export class AdminStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'admin-strategy',
) {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    super({ header: 'apiKey', prefix: '' }, false)
    this.logger = new LineLoggerSubservice(AdminStrategy.name)
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
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to validate API key',
          undefined,
          undefined,
          error,
        ),
      )
      return false
    }
  }
}
