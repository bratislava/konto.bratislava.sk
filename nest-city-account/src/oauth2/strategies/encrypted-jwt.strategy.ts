import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { passportJwtSecret } from 'jwks-rsa'
import { Strategy } from 'passport-jwt'
import { Request } from 'express'
import { decryptData } from '../../utils/crypto'
import { CognitoAccessTokenDto } from '../../utils/global-dtos/cognito.dto'

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
 * Returns the decoded token payload (user data is fetched in the guard after audience validation)
 */
@Injectable()
export class EncryptedJwtStrategy extends PassportStrategy(Strategy, 'encrypted-jwt-strategy') {
  constructor() {
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
      // Note: audience validation and user data fetching are handled in the guard
      // since audience is dynamic per client and we want to validate before fetching user data
    })
  }

  validate(payload: CognitoAccessTokenDto): CognitoAccessTokenDto {
    // Return only the decoded token payload
    // User data will be fetched in handleRequest after audience validation
    return payload
  }
}
