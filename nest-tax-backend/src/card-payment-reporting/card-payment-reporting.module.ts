import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import DatabaseSubservice from '../utils/subservices/database.subservice'
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
    DatabaseSubservice,
  ],
  exports: [CardPaymentReportingService],
  controllers: [CardPaymentReportingController],
})
export class CardPaymentReportingModule {}
