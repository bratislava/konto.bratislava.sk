import { Module } from '@nestjs/common'
import PrismaModule from 'src/prisma/prisma.module'

import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import SignerController from './signer.controller'
import SignerService from './signer.service'

@Module({
  controllers: [SignerController],
  imports: [PrismaModule, FormsModule, FormValidatorRegistryModule],
  providers: [ThrowerErrorGuard, SignerService],
  exports: [SignerService],
})
export default class SignerModule {}
