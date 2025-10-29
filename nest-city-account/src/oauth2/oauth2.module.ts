import { Module } from '@nestjs/common'

import { OAuth2Controller } from './oauth2.controller'
import { OAuth2Service } from './oauth2.service'
import { AuthorizationRequestGuard } from './guards/authorization-request.guard'
import { TokenRequestGuard } from './guards/token-request.guard'
import { AuthorizationContinueGuard } from './guards/authorization-continue.guard'
import { OAuth2ValidationSubservice } from './subservices/oauth2-validation.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'

@Module({
  imports: [],
  providers: [
    OAuth2Service,
    CognitoSubservice,
    ThrowerErrorGuard,
    OAuth2ValidationSubservice,
    AuthorizationRequestGuard,
    TokenRequestGuard,
    AuthorizationContinueGuard,
  ],
  exports: [AuthorizationRequestGuard, TokenRequestGuard],
  controllers: [OAuth2Controller],
})
export class OAuth2Module {}
