import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import jwt from 'jsonwebtoken'
import { v1 as uuidv1 } from 'uuid'

/**
 * RS256 JWTs signed with API_TOKEN_PRIVATE for Slovensko.sk / IAM-style APIs.
 * Used for user (OBO), technical account, and administration call paths.
 */
@Injectable()
export default class ApiJwtTokensService {
  constructor(private readonly configService: ConfigService) {}

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

  createTechnicalAccountJwtToken(): string {
    const payload = {
      sub: this.configService.getOrThrow<string>('SUB_NASES_TECHNICAL_ACCOUNT'),
      jti: uuidv1(),
      obo: null,
    }

    const options: jwt.SignOptions = {
      algorithm: 'RS256',
      expiresIn: '5m', // 5 minutes
    }

    return jwt.sign(payload, this.configService.getOrThrow<string>('API_TOKEN_PRIVATE'), options)
  }
}
