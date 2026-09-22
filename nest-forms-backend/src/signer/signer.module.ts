import { Module } from '@nestjs/common'

import ApiJwtTokensModule from '../api-jwt-tokens/api-jwt-tokens.module'
import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import { AuthV2Module } from '../auth-v2/auth-v2.module'
import ClientsModule from '../clients/clients.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import { FormsV2Module } from '../forms-v2/forms-v2.module'
import SignerController from './signer.controller'
import SignerService from './signer.service'

@Module({
  imports: [
    FormsModule,
    FormValidatorRegistryModule,
    UserInfoPipeModule,
    FormsV2Module,
    AuthV2Module,
    ClientsModule,
    ApiJwtTokensModule,
  ],
  controllers: [SignerController],
  providers: [SignerService],
  exports: [SignerService],
})
export default class SignerModule {}
