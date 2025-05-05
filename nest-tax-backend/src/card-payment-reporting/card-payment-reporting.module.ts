import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import EmailSubservice from '../utils/subservices/email.subservice'
import SftpFileSubservice from '../utils/subservices/sftp-file.subservice'
import { CardPaymentReportingController } from './card-payment-reporting.controller'
import { CardPaymentReportingService } from './card-payment-reporting.service'

@Module({
  imports: [],
  providers: [
    PrismaService,
    ConfigService,
    ThrowerErrorGuard,
    EmailSubservice,
    SftpFileSubservice,
    CardPaymentReportingService,
  ],
  exports: [CardPaymentReportingService],
  controllers: [CardPaymentReportingController],
})
export class CardPaymentReportingModule {}
