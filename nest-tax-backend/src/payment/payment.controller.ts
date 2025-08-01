import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Redirect,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthenticationGuard } from '@nestjs-cognito/auth'
import { Response } from 'express'
import { TiersGuard } from 'src/auth/guards/tiers.guard'
import { Tiers } from 'src/utils/decorators/tier.decorator'
import { CognitoTiersEnum } from 'src/utils/global-dtos/cognito.dto'
import {
  ResponseErrorDto,
  ResponseInternalServerErrorDto,
} from 'src/utils/guards/dtos/error.dto'
import { PaymentResponseQueryDto } from 'src/utils/subservices/dtos/gpwebpay.dto'

import { BratislavaUser } from '../auth/decorators/user-info.decorator'
import { BratislavaUserDto } from '../utils/global-dtos/city-account.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { ResponseGetPaymentUrlDto } from './dtos/requests.payment.dto'
import { PaymentService } from './payment.service'

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  private readonly logger: LineLoggerSubservice

  constructor(private readonly paymentService: PaymentService) {
    this.logger = new LineLoggerSubservice(PaymentController.name)
  }

  @HttpCode(200)
  @ApiOperation({
    summary:
      'Generate payment link to logged user for submitted year if there is no payment.',
    description:
      'If there is payment, there will be error, also if there is paid only one installment, user can not pay by paygate',
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Create url to GP webpay with payment details',
    type: ResponseGetPaymentUrlDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Custom error to create url',
    type: ResponseErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @ApiBearerAuth()
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Post('cardpay/by-year/:year')
  async payment(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Param('year') year: string,
  ) {
    const urlToRedirect = await this.paymentService.getPayGateUrlByUserAndYear(
      year,
      baUser.birthNumber,
    )
    return { url: urlToRedirect }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate payment link for full tax payment for the current year.',
    description:
      'Creates a payment link for paying the entire tax amount or remaining balance for the current year.',
  })
  @ApiResponse({
    status: 200,
    description: 'Create url to GP webpay with payment details',
    type: ResponseGetPaymentUrlDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Custom error to create url',
    type: ResponseErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @ApiBearerAuth()
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Post('cardpay/full-payment/:year')
  async generateFullPaymentLink(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Param('year', ParseIntPipe) year: number,
  ) {
    const urlToRedirect = await this.paymentService.generateFullPaymentLink(
      {
        birthNumber: baUser.birthNumber,
      },
      year,
    )

    return { url: urlToRedirect }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate payment link for installment tax payment.',
    description:
      'Creates a payment link for making an installment payment for the specified year.',
  })
  @ApiResponse({
    status: 200,
    description: 'Create url to GP webpay with payment details',
    type: ResponseGetPaymentUrlDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Custom error to create url',
    type: ResponseErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @ApiBearerAuth()
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Post('cardpay/installment-payment/:year')
  async generateInstallmentPaymentLink(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Param('year', ParseIntPipe) year: number,
  ) {
    const urlToRedirect =
      await this.paymentService.generateInstallmentPaymentLink(
        {
          birthNumber: baUser.birthNumber,
        },
        year,
      )

    return { url: urlToRedirect }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate payment link and redirect to this link to gpwebpay.',
    description:
      'If there is payment, there will be error, also if there is paid only one installment, user can not pay by paygate',
    deprecated: true,
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to GP webpay',
  })
  @ApiResponse({
    status: 422,
    description: 'Error to redirect',
    type: ResponseErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @Get('cardpay/by-tax-id/:uuid')
  async paymentByTaxId(@Param('uuid') uuid: string, @Res() res: Response) {
    try {
      const url = await this.paymentService.redirectToPayGateByTaxId(uuid)
      res.redirect(url)
    } catch (error) {
      this.logger.error(error)
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      const response = (error as HttpException).getResponse()
      if (typeof response === 'object' && 'messageSk' in response) {
        res.end(response.messageSk)
      } else {
        // Handle unexpected error format
        res.end('An unexpected error occurred')
      }
    }
  }

  @ApiResponse({
    status: 302,
    description: 'Redirect to Frontend response',
  })
  @ApiResponse({
    status: 422,
    description: 'Error to redirect',
    type: ResponseErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseErrorDto,
  })
  @Redirect()
  @Get('cardpay/response')
  async paymentResponse(@Query() query: PaymentResponseQueryDto) {
    return { url: await this.paymentService.processPaymentResponse(query) }
  }

  @ApiResponse({
    status: 200,
    description: 'Return image',
  })
  @ApiResponse({
    status: 422,
    description: 'Error to redirect',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseErrorDto,
  })
  @Get('qrcode/email/:taxUuid')
  async getQrCodeByTaxUuid(
    @Param('taxUuid') taxUuid: string,
    @Res() res: Response,
  ) {
    const qrBase64 = await this.paymentService.getQrCodeByTaxUuid(taxUuid)
    const buffer = Buffer.from(qrBase64, 'base64')
    res.writeHead(200, { 'Content-Type': 'image/png' })
    res.end(buffer)
  }
}
