import { Injectable } from '@nestjs/common'

import { CardPaymentReportingService } from '../../card-payment-reporting/card-payment-reporting.service'
import DatabaseSubservice from '../../utils/subservices/database.subservice'

@Injectable()
export class ReportingTasksService {
  constructor(
    private readonly databaseSubservice: DatabaseSubservice,
    private readonly cardPaymentReportingService: CardPaymentReportingService,
  ) {}

  async reportCardPayments() {
    const config = await this.databaseSubservice.getConfigByKeys([
      'REPORTING_GENERATE_REPORT',
      'REPORTING_RECIPIENT_EMAIL',
    ])

    if (!config.REPORTING_GENERATE_REPORT) {
      return
    }

    const emailRecipients = config.REPORTING_RECIPIENT_EMAIL.split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0)

    await this.cardPaymentReportingService.generateAndSendPaymentReport(
      emailRecipients,
    )
  }
}
