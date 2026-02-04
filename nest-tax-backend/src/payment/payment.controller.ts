import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthenticationGuard } from '@nestjs-cognito/auth'
import { TaxType } from '@prisma/client'
import { UserVerifyStateCognitoTierEnum } from 'openapi-clients/city-account'

import { BratislavaUser } from '../auth/decorators/user-info.decorator'
import { TiersGuard } from '../auth/guards/tiers.guard'
import { PaymentResponseQueryDto } from '../gpwebpay/dtos/gpwebpay.dto'
import { Tiers } from '../utils/decorators/tier.decorator'
import { BratislavaUserDto } from '../utils/global-dtos/city-account.dto'
import {
  ResponseErrorDto,
  ResponseInternalServerErrorDto,
} from '../utils/guards/dtos/error.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  PaymentRedirectResponseDto,
  PaymentRedirectStateEnum,
} from './dtos/redirect.payent.dto'
import { ResponseGetPaymentUrlDto } from './dtos/requests.payment.dto'
import { PaymentService } from './payment.service'

@ApiTags('payment')
@ApiExtraModels(PaymentRedirectResponseDto)
@Controller('payment')
export class PaymentController {
  private readonly logger: LineLoggerSubservice

  constructor(private readonly paymentService: PaymentService) {
    this.logger = new LineLoggerSubservice(PaymentController.name)
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

  @ApiResponse({
    status: 302,
    description:
      'Redirect to Frontend with status query parameter. The redirect URL will contain query parameters documented in PaymentRedirectResponseDto.',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description:
            'Redirect URL with status query parameter. Status values are defined in PaymentRedirectStateEnum.',
          example: `https://frontend.bratislava.sk?status=${PaymentRedirectStateEnum.PAYMENT_SUCCESS}&taxType=DZN&year=2024@order=1`,
        },
      },
    },
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
  @Get('cardpay/response/:taxType')
  async paymentResponse(
    @Param('taxType', new ParseEnumPipe(TaxType)) taxType: TaxType,
    @Query() query: PaymentResponseQueryDto,
  ) {
    return {
      url: await this.paymentService.processPaymentResponse(taxType, query),
    }
  }
}
