import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { passportJwtSecret } from 'jwks-rsa'
import { ExtractJwt, Strategy } from 'passport-jwt'

import BaConfigService from '../../config/ba-config.service'
import { CognitoAccessTokenDto, CognitoGetUserData } from '../../utils/global-dtos/cognito.dto'
import { CognitoSubservice } from '../../utils/subservices/cognito.subservice'

@Injectable()
export class CognitoStrategy extends PassportStrategy(Strategy, 'cognito-strategy') {
  constructor(
    private cognitoSubservice: CognitoSubservice,
    baConfigService: BaConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: baConfigService.cognito.clientId,
      issuer: `https://cognito-idp.${baConfigService.cognito.region}.amazonaws.com/${baConfigService.cognito.userPoolId}`,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://cognito-idp.${baConfigService.cognito.region}.amazonaws.com/${baConfigService.cognito.userPoolId}/.well-known/jwks.json`,
      }),
    })
  }

  async validate(payload: CognitoAccessTokenDto): Promise<CognitoGetUserData> {
    const data = await this.cognitoSubservice.getDataFromCognito(payload.sub)
    return data
  }
}
