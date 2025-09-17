import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { NorisService } from './noris.service'
import { NorisConnectionSubservice } from './subservices/noris-connection.subservice'
import { NorisDeliveryMethodSubservice } from './subservices/noris-delivery-method.subservice'
import { NorisPaymentSubservice } from './subservices/noris-payment.subservice'
import { NorisTaxSubservice } from './subservices/noris-tax.subservice'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'

@Module({
  imports: [PrismaModule, BloomreachModule],
  providers: [
    NorisService,
    NorisConnectionSubservice,
    NorisDeliveryMethodSubservice,
    NorisPaymentSubservice,
    NorisTaxSubservice,
    ThrowerErrorGuard,
    CityAccountSubservice,
    QrCodeSubservice,
  ],
  exports: [NorisService],
  controllers: [],
})
export class NorisModule {}
