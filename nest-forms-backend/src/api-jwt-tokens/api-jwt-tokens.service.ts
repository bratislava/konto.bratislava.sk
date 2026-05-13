import { Injectable } from '@nestjs/common'
import jwt from 'jsonwebtoken'
import { v1 as uuidv1 } from 'uuid'

const defaultOptions: jwt.SignOptions = {
  algorithm: 'RS256',
  expiresIn: '5m', // 5 minutes
}

/**
 * RS256 JWTs signed with API_TOKEN_PRIVATE for Slovensko.sk / IAM-style APIs.
 * Used for user (OBO), technical account, and administration call paths.
 */
@Injectable()
export default class ApiJwtTokensService {
  createUserJwtToken(oboToken: string, privateToken: string): string {
    const payload = {
      jti: uuidv1(),
      obo: oboToken,
    }
    const options: jwt.SignOptions = {
      ...defaultOptions,
      header: {
        alg: 'RS256',
        cty: 'JWT',
      },
    }

    return jwt.sign(payload, privateToken, options)
  }

  createTechnicalAccountJwtToken(sub: string, privateToken: string): string {
    const payload = {
      sub,
      jti: uuidv1(),
      obo: null,
    }

    const options: jwt.SignOptions = defaultOptions

    return jwt.sign(payload, privateToken, options)
  }

  createAdministrationJwtToken(privateToken: string): string {
    const payload = {
      jti: uuidv1(),
    }

    const options: jwt.SignOptions = defaultOptions

    return jwt.sign(payload, privateToken, options)
  }
}
