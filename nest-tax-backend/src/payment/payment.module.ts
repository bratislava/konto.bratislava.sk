import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module.js'
import { BloomreachModule } from '../bloomreach/bloomreach.module.js'
import ClientsModule from '../clients/clients.module.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { TaxModule } from '../tax/tax.module.js'
import ThrowerErrorGuard from '../utils/guards/errors.guard.js'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice.js'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice.js'
import { UtilsModule } from '../utils-module/utils.module.js'
import { PaymentController } from './payment.controller.js'
import { PaymentService } from './payment.service.js'
import { GpWebpaySubservice } from './subservices/gpwebpay.subservice.js'

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
    GpWebpaySubservice,
    CognitoSubservice,
    ThrowerErrorGuard,
    CityAccountSubservice,
  ],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
