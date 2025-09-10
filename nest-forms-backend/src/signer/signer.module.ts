import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import { AuthV2Module } from '../auth-v2/auth-v2.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import { FormsV2Module } from '../forms-v2/forms-v2.module'
import PrismaModule from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import SignerController from './signer.controller'
import SignerService from './signer.service'

@Module({
  imports: [
    PrismaModule,
    FormsModule,
    FormValidatorRegistryModule,
    UserInfoPipeModule,
    FormsV2Module,
    AuthV2Module,
  ],
  controllers: [SignerController],
  providers: [ThrowerErrorGuard, SignerService],
  exports: [SignerService],
})
export default class SignerModule {}
