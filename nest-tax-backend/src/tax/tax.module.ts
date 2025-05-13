import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import ThrowerErrorGuard from 'src/utils/guards/errors.guard'
import { CognitoSubservice } from 'src/utils/subservices/cognito.subservice'
import { QrCodeSubservice } from 'src/utils/subservices/qrcode.subservice'

import { TaxController } from './tax.controller'
import { TaxService } from './tax.service'
import { TaxControllerV2 } from './tax.v2.controller'
import { PaymentModule } from '../payment/payment.module'

@Module({
  imports: [PrismaModule, PaymentModule],
  providers: [
    TaxService,
    CognitoSubservice,
    ThrowerErrorGuard,
    QrCodeSubservice,
  ],
  exports: [TaxService],
  controllers: [TaxController, TaxControllerV2],
})
export class TaxModule {}
