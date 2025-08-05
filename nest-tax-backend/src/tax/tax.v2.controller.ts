import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthenticationGuard } from '@nestjs-cognito/auth'
import { TiersGuard } from 'src/auth/guards/tiers.guard'
import { Tiers } from 'src/utils/decorators/tier.decorator'
import { CognitoTiersEnum } from 'src/utils/global-dtos/cognito.dto'
import {
  ResponseErrorDto,
  ResponseInternalServerErrorDto,
} from 'src/utils/guards/dtos/error.dto'

import { BratislavaUser } from '../auth/decorators/user-info.decorator'
import { BratislavaUserDto } from '../utils/global-dtos/city-account.dto'
import { DeliveryMethodTaxDto, ResponseTaxSummaryDetailDto } from './dtos/response.tax.dto'
import { TaxService } from './tax.service'
import { CustomErrorTaxTypesResponseEnum } from './dtos/error.dto'

@ApiTags('tax')
@ApiBearerAuth()
@Controller({ path: 'tax', version: '2' })
export class TaxControllerV2 {
  constructor(private readonly taxService: TaxService) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get tax detail by year.',
  })
  @ApiResponse({
    status: 200,
    description: 'Load tax detail about user.',
    type: ResponseTaxSummaryDetailDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Error to load tax data',
    type: ResponseErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Get('get-tax-detail-by-year')
  async getTaxDetailByYear(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Query('year') year: number,
  ) {
    return this.taxService.getTaxDetail(baUser.birthNumber, year)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get delivery method by year.',
  })
  @ApiResponse({
    status: 200,
    description: 'Get delivery method of user.',
    type: DeliveryMethodTaxDto,
  })
  @ApiResponse({
    status: 404,
    description: CustomErrorTaxTypesResponseEnum.TAX_USER_NOT_FOUND,
    type: ResponseErrorDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Error to load tax data',
    type: ResponseErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Get('get-delivery-method')
  async getDeliveryMethod(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Query('year') year: number,
  ) {
    return this.taxService.getDeliveryMethod(baUser.birthNumber, year)
  }
}
