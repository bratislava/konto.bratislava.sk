import { Module } from '@nestjs/common'
import PrismaModule from 'src/prisma/prisma.module'

import AuthModule from '../auth/auth.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import SignerController from './signer.controller'
import SignerService from './signer.service'

@Module({
  imports: [PrismaModule, FormsModule, FormValidatorRegistryModule, AuthModule],
  controllers: [SignerController],
  providers: [ThrowerErrorGuard, SignerService],
  exports: [SignerService],
})
export default class SignerModule {}
