import { Module } from '@nestjs/common'
import { BloomreachModule } from 'src/bloomreach/bloomreach.module'
import ClientsModule from 'src/clients/clients.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import ThrowerErrorGuard from 'src/utils/guards/errors.guard'
import { CityAccountSubservice } from 'src/utils/subservices/cityaccount.subservice'
import { CognitoSubservice } from 'src/utils/subservices/cognito.subservice'
import { GpWebpaySubservice } from 'src/utils/subservices/gpwebpay.subservice'

import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'

@Module({
  imports: [PrismaModule, BloomreachModule, ClientsModule],
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
