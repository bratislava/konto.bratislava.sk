import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { NorisService } from './noris.service'
import { NorisConnectionSubservice } from './subservices/noris-connection.subservice'
import { NorisDeliveryMethodSubservice } from './subservices/noris-delivery-method.subservice'
import { NorisPaymentSubservice } from './subservices/noris-payment.subservice'
import { NorisTaxSubservice } from './subservices/noris-tax.subservice'

@Module({
  imports: [PrismaModule],
  providers: [
    NorisService,
    NorisConnectionSubservice,
    NorisDeliveryMethodSubservice,
    NorisPaymentSubservice,
    NorisTaxSubservice,
    ThrowerErrorGuard,
  ],
  exports: [NorisService],
  controllers: [],
})
export class NorisModule {}
