import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  Param,
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
import { BratislavaUser } from 'src/auth/guards/cognito.guard'
import { TiersGuard } from 'src/auth/guards/tiers.guard'
import { Tiers } from 'src/utils/decorators/tier.decorator'
import { CognitoTiersEnum } from 'src/utils/global-dtos/cognito.dto'
import {
  ResponseCustomPaymentErrorDto,
  ResponseInternalServerErrorDto,
} from 'src/utils/guards/dtos/error.dto'
import { PaymentResponseQueryDto } from 'src/utils/subservices/dtos/gpwebpay.dto'

import { BratislavaUserDto } from '../utils/global-dtos/city-account.dto'
import { ResponseGetPaymentUrlDto } from './dtos/requests.payment.dto'
import { PaymentService } from './payment.service'

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @HttpCode(200)
  @ApiOperation({
    summary:
      'Generate payment link to logged user for submitted year if there is no payment.',
    description:
      'If there is payment, there will be error, also if there is payed only one installment, user can not pay by paygate',
  })
  @ApiResponse({
    status: 200,
    description: 'Create url to GP webpay with payment details',
    type: ResponseGetPaymentUrlDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Custom error to create url',
    type: ResponseCustomPaymentErrorDto,
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
    summary: 'Generate payment link and redirect to this link to gpwebpay.',
    description:
      'If there is payment, there will be error, also if there is payed only one installment, user can not pay by paygate',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to GP webpay',
  })
  @ApiResponse({
    status: 422,
    description: 'Error to redirect',
    type: ResponseCustomPaymentErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @Get('cardpay/by-tax-id/:uuid')
  async paymentByTaxId(@Param('uuid') uuid: string, @Res() res: any) {
    try {
      const url = await this.paymentService.redirectToPayGateByTaxId(uuid)
      res.redirect(url)
    } catch (error) {
      console.error(error)
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
    type: ResponseCustomPaymentErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
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
    type: ResponseInternalServerErrorDto,
  })
  @Get('qrcode/email/:taxUuid')
  async getQrCodeByTaxUuid(@Param('taxUuid') taxUuid: string, @Res() res: any) {
    const qrBase64 = await this.paymentService.getQrCodeByTaxUuid(taxUuid)
    const buffer = Buffer.from(qrBase64, 'base64')
    res.writeHead(200, { 'Content-Type': 'image/png' })
    res.end(buffer)
  }
}
