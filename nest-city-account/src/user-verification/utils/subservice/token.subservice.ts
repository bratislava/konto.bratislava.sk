import jwt from 'jsonwebtoken'
import { v1 as uuidv1 } from 'uuid'
import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'

/**
 * Inspired by nest-forms-backend -> tokens.nases.service
 */

@Injectable()
export default class TokenSubservice {
  constructor(private configService: ConfigService) {}

  createUserJwtToken(oboToken: string): string {
    const payload = {
      jti: uuidv1(),
      obo: oboToken,
    }
    const options: jwt.SignOptions = {
      algorithm: 'RS256',
      expiresIn: '5m', // 5 minutes
      header: {
        alg: 'RS256',
        cty: 'JWT',
      },
    }

    return jwt.sign(payload, this.configService.getOrThrow<string>('API_TOKEN_PRIVATE'), options)
  }
}
