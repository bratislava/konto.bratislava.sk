import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import { BloomreachModule } from '../bloomreach/bloomreach.module'
import ClientsModule from '../clients/clients.module'
import { PrismaModule } from '../prisma/prisma.module'
import { TaxModule } from '../tax/tax.module'
import { UtilsModule } from '../utils-module/utils.module'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { GpWebpaySubservice } from './subservices/gpwebpay.subservice'

@Module({
  imports: [
    PrismaModule,
    BloomreachModule,
    ClientsModule,
    UserInfoPipeModule,
    TaxModule,
    UtilsModule,
  ],
  providers: [PaymentService, GpWebpaySubservice],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
