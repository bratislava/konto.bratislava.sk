import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import ClientsModule from '../clients/clients.module'
import { PrismaModule } from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'
import { TaxController } from './tax.controller'
import { TaxService } from './tax.service'
import { TaxControllerV2 } from './tax.v2.controller'

@Module({
  imports: [PrismaModule, ClientsModule, UserInfoPipeModule],
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
