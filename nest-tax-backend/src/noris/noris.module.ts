import { Module } from '@nestjs/common'

import { BloomreachModule } from '../bloomreach/bloomreach.module.js'
import ClientsModule from '../clients/clients.module.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import ThrowerErrorGuard from '../utils/guards/errors.guard.js'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice.js'
import DatabaseSubservice from '../utils/subservices/database.subservice.js'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice.js'
import { NorisService } from './noris.service.js'
import { NorisConnectionSubservice } from './subservices/noris-connection.subservice.js'
import { NorisDeliveryMethodSubservice } from './subservices/noris-delivery-method.subservice.js'
import { NorisPaymentSubservice } from './subservices/noris-payment.subservice.js'
import { NorisTaxSubservice } from './subservices/noris-tax.subservice.js'
import { NorisTaxCommunalWasteSubservice } from './subservices/noris-tax/noris-tax.communal-waste.subservice.js'
import { NorisTaxRealEstateSubservice } from './subservices/noris-tax/noris-tax.real-estate.subservice.js'
import { NorisValidatorSubservice } from './subservices/noris-validator.subservice.js'

@Module({
  imports: [PrismaModule, BloomreachModule, ClientsModule],
  providers: [
    NorisService,
    NorisConnectionSubservice,
    NorisDeliveryMethodSubservice,
    NorisPaymentSubservice,
    NorisTaxSubservice,
    ThrowerErrorGuard,
    DatabaseSubservice,
    CityAccountSubservice,
    QrCodeSubservice,
    NorisTaxRealEstateSubservice,
    NorisTaxCommunalWasteSubservice,
    NorisValidatorSubservice,
  ],
  exports: [NorisService],
  controllers: [],
})
export class NorisModule {}
