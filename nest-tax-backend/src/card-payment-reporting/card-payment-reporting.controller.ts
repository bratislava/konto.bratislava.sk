import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'
import { AdminGuard } from 'src/auth/guards/admin.guard'

import { RequestPostReportingSendReport } from '../admin/dtos/requests.dto'
import { CardPaymentReportingService } from './card-payment-reporting.service'

@ApiTags('card-payment-reporting')
@Controller('card-payment-reporting')
@ApiSecurity('apiKey')
export class CardPaymentReportingController {
  constructor(
    private readonly cardPaymentReportingService: CardPaymentReportingService,
  ) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Send payment report to an email',
  })
  @ApiResponse({
    status: 200,
    description: 'Email sent.',
  })
  @UseGuards(AdminGuard)
  @Post('send-report')
  async sendReport(
    @Body() data: RequestPostReportingSendReport,
  ): Promise<void> {
    return this.cardPaymentReportingService.generateAndSendPaymentReport(
      data.emailRecipients,
      new Date(data.date),
    )
  }
}
