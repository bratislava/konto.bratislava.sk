import { Module } from '@nestjs/common'

import { OAuth2Controller } from './oauth2.controller'
import { OAuth2Service } from './oauth2.service'
import { ClientAuthGuard } from './guards/client-auth.guard'
import { ClientIdGuard } from './guards/client-id.guard'
import { ContinuePayloadGuard } from './guards/continue-payload.guard'
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
    ClientAuthGuard,
    ClientIdGuard,
    ContinuePayloadGuard,
  ],
  exports: [ClientAuthGuard, ClientIdGuard],
  controllers: [OAuth2Controller],
})
export class OAuth2Module {}
