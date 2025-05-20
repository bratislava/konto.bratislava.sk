import { Injectable, UnauthorizedException } from '@nestjs/common'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { CognitoJwtVerifierSingleUserPool } from 'aws-jwt-verify/cognito-verifier'

import BaConfigService from '../../config/ba-config.service'

@Injectable()
export class CognitoJwtVerifyService {
  private verifier: CognitoJwtVerifierSingleUserPool<{
    userPoolId: string
    clientId: string
    tokenUse: 'access'
  }>

  constructor(private readonly baConfigService: BaConfigService) {
    this.verifier = CognitoJwtVerifier.create({
      userPoolId: this.baConfigService.cognito.userPoolId,
      clientId: this.baConfigService.cognito.clientId,
      tokenUse: 'access',
    })
  }

  async verify(bearerToken: string) {
    try {
      return await this.verifier.verify(bearerToken)
    } catch (error) {
      throw new UnauthorizedException(`Failed to verify JWT: ${error}`)
    }
  }
}
