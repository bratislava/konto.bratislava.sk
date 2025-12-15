import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import { BloomreachModule } from '../bloomreach/bloomreach.module'
import ClientsModule from '../clients/clients.module'
import { PrismaModule } from '../prisma/prisma.module'
import { TaxModule } from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { GpWebpaySubservice } from '../utils/subservices/gpwebpay.subservice'
import { UtilsModule } from '../utils-module/utils.module'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'

@Module({
  imports: [
    PrismaModule,
    BloomreachModule,
    ClientsModule,
    UserInfoPipeModule,
    TaxModule,
    UtilsModule,
  ],
  providers: [
    PaymentService,
    CognitoSubservice,
    GpWebpaySubservice,
    ThrowerErrorGuard,
    CityAccountSubservice,
  ],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
