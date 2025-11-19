import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import ClientsModule from '../clients/clients.module'
import { PrismaModule } from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'
import { TaxCommunalWasteSubservice } from './subservices/tax/tax.communal-waste.subservice'
import { TaxRealEstateSubservice } from './subservices/tax/tax.real-estate.subservice'
import { TaxService } from './tax.service'
import { TaxControllerV2 } from './tax.v2.controller'

@Module({
  imports: [PrismaModule, ClientsModule, UserInfoPipeModule],
  providers: [
    TaxService,
    CognitoSubservice,
    ThrowerErrorGuard,
    QrCodeSubservice,
    TaxRealEstateSubservice,
    TaxCommunalWasteSubservice,
  ],
  exports: [TaxService],
  controllers: [TaxControllerV2],
})
export class TaxModule {}
