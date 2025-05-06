import { Controller, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'
import { AdminGuard } from 'src/auth/guards/admin.guard'

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
    @Query('date') date: string,
    @Query('email') email: string,
  ): Promise<any> {
    return this.cardPaymentReportingService.generateAndSendPaymentReport(
      email,
      new Date(date),
    )
  }
}
