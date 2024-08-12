import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ErrorThrowerGuard } from 'src/utils/guards/errors.guard'
import { CognitoSubservice } from 'src/utils/subservices/cognito.subservice'
import { QrCodeSubservice } from 'src/utils/subservices/qrcode.subservice'

import { TaxController } from './tax.controller'
import { TaxService } from './tax.service'

@Module({
  imports: [PrismaModule],
  providers: [
    TaxService,
    CognitoSubservice,
    ErrorThrowerGuard,
    QrCodeSubservice,
  ],
  exports: [TaxService],
  controllers: [TaxController],
})
export class TaxModule {}
