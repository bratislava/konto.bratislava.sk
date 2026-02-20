import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module.js'
import ClientsModule from '../clients/clients.module.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import ThrowerErrorGuard from '../utils/guards/errors.guard.js'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice.js'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice.js'
import { TaxService } from './tax.service.js'
import { TaxControllerV2 } from './tax.v2.controller.js'

@Module({
  imports: [PrismaModule, ClientsModule, UserInfoPipeModule],
  providers: [
    TaxService,
    CognitoSubservice,
    ThrowerErrorGuard,
    QrCodeSubservice,
  ],
  exports: [TaxService],
  controllers: [TaxControllerV2],
})
export class TaxModule {}
