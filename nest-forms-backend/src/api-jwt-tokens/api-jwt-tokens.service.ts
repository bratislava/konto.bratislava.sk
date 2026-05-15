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
  /**
   * Default options: RS256, 5-minute expiry.
   * Pass `options` to override any of the defaults further.
   */
  createUserJwtToken(
    oboToken: string,
    privateToken: string,
    options?: jwt.SignOptions,
  ): string {
    const payload = {
      jti: uuidv1(),
      obo: oboToken,
    }
    const signOptions: jwt.SignOptions = {
      ...defaultOptions,
      header: {
        alg: 'RS256',
        cty: 'JWT',
      },
      ...options,
    }

    return jwt.sign(payload, privateToken, signOptions)
  }

  /**
   * Default options: RS256, 5-minute expiry.
   * Pass `options` to override any of the defaults.
   */
  createTechnicalAccountJwtToken(
    sub: string,
    privateToken: string,
    options?: jwt.SignOptions,
  ): string {
    const payload = {
      sub,
      jti: uuidv1(),
      obo: null,
    }

    return jwt.sign(payload, privateToken, { ...defaultOptions, ...options })
  }

  /**
   * Default options: RS256, 5-minute expiry.
   * Pass `options` to override any of the defaults.
   */
  createAdministrationJwtToken(
    privateToken: string,
    options?: jwt.SignOptions,
  ): string {
    const payload = {
      jti: uuidv1(),
    }

    return jwt.sign(payload, privateToken, { ...defaultOptions, ...options })
  }
}
