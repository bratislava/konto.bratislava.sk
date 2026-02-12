// utils/shared.module.ts
import { CognitoSubservice } from './cognito.subservice'
import ThrowerErrorGuard from '../guards/errors.guard'
import { TaxSubservice } from './tax.subservice'
import { ConfigModule } from '@nestjs/config'
import ClientsModule from '../../clients/clients.module'
import { PrismaModule } from '../../prisma/prisma.module'
import { Global, Module } from '@nestjs/common'
import { TurnstileSubservice } from './turnstile.subservice'

@Global()
@Module({
  imports: [PrismaModule, ClientsModule, ConfigModule],
  providers: [ThrowerErrorGuard, TaxSubservice, CognitoSubservice, TurnstileSubservice],
  exports: [ThrowerErrorGuard, TaxSubservice, CognitoSubservice, TurnstileSubservice],
})
export class SharedModule {}
