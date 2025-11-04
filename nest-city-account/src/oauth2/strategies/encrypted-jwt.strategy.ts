import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { passportJwtSecret } from 'jwks-rsa'
import { Strategy } from 'passport-jwt'
import { Request } from 'express'
import { decryptData } from '../../utils/crypto'
import { CognitoAccessTokenDto, CognitoGetUserData } from '../../utils/global-dtos/cognito.dto'
import { CognitoSubservice } from '../../utils/subservices/cognito.subservice'

/**
 * Custom JWT extractor that decrypts the encrypted token from the Authorization header
 */
export const extractEncryptedJwt = (req: Request): string | null => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const encryptedToken = authHeader.substring(7)
  try {
    return decryptData(encryptedToken)
  } catch (error) {
    // If decryption fails, return null to let Passport handle the error
    return null
  }
}

/**
 * Passport Strategy for validating encrypted Cognito JWTs
 * Decrypts the token and validates it against Cognito JWKS
 * Fetches full user data from Cognito
 */
@Injectable()
export class EncryptedJwtStrategy extends PassportStrategy(Strategy, 'encrypted-jwt-strategy') {
  constructor(private cognitoSubservice: CognitoSubservice) {
    const issuer = `https://cognito-idp.${process.env.AWS_COGNITO_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USERPOOL_ID}`

    super({
      jwtFromRequest: extractEncryptedJwt,
      ignoreExpiration: false,
      issuer,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuer}/.well-known/jwks.json`,
      }),
      // Note: audience validation is handled in the guard since it's dynamic per client
      // passport-jwt requires a static audience, so we validate it in OAuth2AccessGuard instead
    })
  }

  async validate(payload: CognitoAccessTokenDto): Promise<CognitoGetUserData> {
    const data = await this.cognitoSubservice.getDataFromCognito(payload.sub)
    return data
  }
}
