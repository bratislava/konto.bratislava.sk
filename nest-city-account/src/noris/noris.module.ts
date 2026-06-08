import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { NorisConnectionService } from './services/noris-connection.service'
import { NorisDeliveryMethodService } from './services/noris-delivery-method.service'
import { NorisEdeskService } from './services/noris-edesk.service'
import { NorisValidatorService } from './services/noris-validator.service'

@Module({
  imports: [PrismaModule],
  providers: [
    NorisConnectionService,
    NorisValidatorService,
    NorisEdeskService,
    NorisDeliveryMethodService,
  ],
  exports: [NorisEdeskService, NorisDeliveryMethodService],
})
export class NorisModule {}
