import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { NorisConnectionService } from './noris-connection.service'
import { NorisDeliveryMethodService } from './noris-delivery-method.service'
import { NorisEdeskService } from './noris-edesk.service'
import { NorisValidatorService } from './noris-validator.service'

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
