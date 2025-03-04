import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { passportJwtSecret } from 'jwks-rsa'
import { ExtractJwt, Strategy } from 'passport-jwt'

import AuthService from '../auth.service'
import { CognitoAccessTokenDto, CognitoGetUserData } from '../dtos/cognito.dto'

@Injectable()
export default class CognitoStrategy extends PassportStrategy(
  Strategy,
  'cognito-strategy',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: process.env.AWS_COGNITO_COGNITO_CLIENT_ID,
      issuer: `https://cognito-idp.${
        process.env.AWS_COGNITO_REGION ?? ''
      }.amazonaws.com/${process.env.AWS_COGNITO_USERPOOL_ID ?? ''}`,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://cognito-idp.${
          process.env.AWS_COGNITO_REGION ?? ''
        }.amazonaws.com/${
          process.env.AWS_COGNITO_USERPOOL_ID ?? ''
        }/.well-known/jwks.json`,
      }),
    })
  }

  async validate(payload: CognitoAccessTokenDto): Promise<CognitoGetUserData> {
    const data = await this.authService.getDataFromCognito(payload.sub)
    return data
  }
}
