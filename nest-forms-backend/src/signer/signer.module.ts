import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import FormsModule from '../forms/forms.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import SignerService from './signer.service'

@Module({
  controllers: [SignerController],
  imports: [
    FormsModule,
    // FilesModule,
  ],
  providers: [ThrowerErrorGuard, ConfigService],
  exports: [SignerService],
})
export default class SignerModule {}
