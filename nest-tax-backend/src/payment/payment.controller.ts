import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  Param,
  ParseEnumPipe,
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
import { TaxType } from '@prisma/client'
import { UserVerifyStateCognitoTierEnum } from 'openapi-clients/city-account'

import { BratislavaUser } from '../auth/decorators/user-info.decorator'
import { TiersGuard } from '../auth/guards/tiers.guard'
import { Tiers } from '../utils/decorators/tier.decorator'
import { BratislavaUserDto } from '../utils/global-dtos/city-account.dto'
import {
  ResponseErrorDto,
  ResponseInternalServerErrorDto,
} from '../utils/guards/dtos/error.dto'
import { PaymentResponseQueryDto } from '../utils/subservices/dtos/gpwebpay.dto'
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
      'Generate payment link to logged user for submitted year and tax type if there is no payment.',
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
  @Tiers(UserVerifyStateCognitoTierEnum.IdentityCard)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Post('cardpay/by-year-and-type/:year/:type/:order')
  async payment(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Param('year') year: string,
    @Param('type', new ParseEnumPipe(TaxType)) type: TaxType,
    @Param('order', ParseIntPipe) order: number,
  ) {
    const urlToRedirect = await this.paymentService.getPayGateUrlByUserYearType(
      year,
      baUser.birthNumber,
      type,
      order,
    )
    return { url: urlToRedirect }
  }

  @HttpCode(200)
  @ApiOperation({
    summary:
      'Generate payment link for full tax payment for the current year and tax type.',
    description:
      'Creates a payment link for paying the entire tax amount or remaining balance for the current year and tax type.',
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
  @Tiers(UserVerifyStateCognitoTierEnum.IdentityCard)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Post('cardpay/full-payment/:year/:type/:order')
  async generateFullPaymentLink(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Param('year', ParseIntPipe) year: number,
    @Param('type', new ParseEnumPipe(TaxType)) type: TaxType,
    @Param('order', ParseIntPipe) order: number,
  ) {
    const urlToRedirect = await this.paymentService.generateFullPaymentLink(
      {
        birthNumber: baUser.birthNumber,
      },
      year,
      type,
      order,
    )

    return { url: urlToRedirect }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate payment link for installment tax payment.',
    description:
      'Creates a payment link for making an installment payment for the specified year and tax type.',
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
  @Tiers(UserVerifyStateCognitoTierEnum.IdentityCard)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Post('cardpay/installment-payment/:year/:type/:order')
  async generateInstallmentPaymentLink(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Param('year', ParseIntPipe) year: number,
    @Param('type', new ParseEnumPipe(TaxType)) type: TaxType,
    @Param('order', ParseIntPipe) order: number,
  ) {
    const urlToRedirect =
      await this.paymentService.generateInstallmentPaymentLink(
        {
          birthNumber: baUser.birthNumber,
        },
        year,
        type,
        order,
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
  async paymentByTaxId(@Param('uuid') uuid: string, @Res() res: any) {
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
}
