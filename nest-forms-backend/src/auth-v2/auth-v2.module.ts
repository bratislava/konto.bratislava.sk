import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import ClientsModule from '../clients/clients.module'
import BaConfigModule from '../config/ba-config.module'
import { UserAuthGuard } from './guards/user-auth.guard'
import { CityAccountUserService } from './services/city-account-user.service'
import { CognitoGuestIdentityService } from './services/cognito-guest-identity.service'
import { CognitoJwtVerifyService } from './services/cognito-jwt-verify.service'
import { CognitoProvidersService } from './services/cognito-providers.service'
import { CognitoUserService } from './services/cognito-user.service'
import { UserAuthStrategy } from './strategies/user-auth.strategy'

@Module({
  imports: [PassportModule, ClientsModule, BaConfigModule],
  providers: [
    CognitoJwtVerifyService,
    CognitoProvidersService,
    CognitoUserService,
    CognitoGuestIdentityService,
    CityAccountUserService,
    UserAuthStrategy,
    UserAuthGuard,
  ],
  exports: [UserAuthGuard],
  controllers: [],
})
export class AuthV2Module {}
