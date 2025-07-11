import { Module } from '@nestjs/common'
import { BloomreachModule } from 'src/bloomreach/bloomreach.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import ThrowerErrorGuard from 'src/utils/guards/errors.guard'
import { CityAccountSubservice } from 'src/utils/subservices/cityaccount.subservice'
import { CognitoSubservice } from 'src/utils/subservices/cognito.subservice'
import { GpWebpaySubservice } from 'src/utils/subservices/gpwebpay.subservice'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import ClientsModule from '../clients/clients.module'
import { TaxModule } from '../tax/tax.module'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'

@Module({
  imports: [
    PrismaModule,
    BloomreachModule,
    ClientsModule,
    UserInfoPipeModule,
    TaxModule,
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
