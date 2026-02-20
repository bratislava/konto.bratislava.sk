import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { PrismaService } from '../prisma/prisma.service.js'
import ThrowerErrorGuard from '../utils/guards/errors.guard.js'
import DatabaseSubservice from '../utils/subservices/database.subservice.js'
import EmailSubservice from '../utils/subservices/email.subservice.js'
import SftpFileSubservice from '../utils/subservices/sftp-file.subservice.js'
import { CardPaymentReportingController } from './card-payment-reporting.controller.js'
import { CardPaymentReportingService } from './card-payment-reporting.service.js'

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
