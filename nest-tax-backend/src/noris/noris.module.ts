import { Module } from '@nestjs/common'

import { BloomreachModule } from '../bloomreach/bloomreach.module'
import ClientsModule from '../clients/clients.module'
import { PrismaModule } from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'
import { NorisService } from './noris.service'
import { NorisConnectionSubservice } from './subservices/noris-connection.subservice'
import { NorisDeliveryMethodSubservice } from './subservices/noris-delivery-method.subservice'
import { NorisPaymentSubservice } from './subservices/noris-payment.subservice'
import { NorisTaxSubservice } from './subservices/noris-tax.subservice'
import { NorisTaxCommunalWasteSubservice } from './subservices/noris-tax/noris-tax.communal-waste.subservice'
import { NorisTaxRealEstateSubservice } from './subservices/noris-tax/noris-tax.real-estate.subservice'

@Module({
  imports: [PrismaModule, BloomreachModule, ClientsModule],
  providers: [
    NorisService,
    NorisConnectionSubservice,
    NorisDeliveryMethodSubservice,
    NorisPaymentSubservice,
    NorisTaxSubservice,
    ThrowerErrorGuard,
    CityAccountSubservice,
    QrCodeSubservice,
    NorisTaxRealEstateSubservice,
    NorisTaxCommunalWasteSubservice,
  ],
  exports: [NorisService],
  controllers: [],
})
export class NorisModule {}
