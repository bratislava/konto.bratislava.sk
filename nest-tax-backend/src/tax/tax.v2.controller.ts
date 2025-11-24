import {
  Controller,
  Get,
  HttpCode,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
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
import {
  ResponseCommunalWasteTaxSummaryDetailDto,
  ResponseGetTaxesListDto,
  ResponseRealEstateTaxSummaryDetailDto,
} from './dtos/response.tax.dto'
import { TaxService } from './tax.service'

@ApiTags('tax')
@ApiBearerAuth()
@Controller({ path: 'tax', version: '2' })
export class TaxControllerV2 {
  constructor(private readonly taxService: TaxService) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get tax detail by year and type.',
  })
  @ApiExtraModels(
    ResponseRealEstateTaxSummaryDetailDto,
    ResponseCommunalWasteTaxSummaryDetailDto,
  )
  @ApiResponse({
    status: 200,
    description: 'Load tax detail about user.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(ResponseRealEstateTaxSummaryDetailDto) },
        { $ref: getSchemaPath(ResponseCommunalWasteTaxSummaryDetailDto) },
      ],
      discriminator: {
        propertyName: 'type',
        mapping: {
          DZN: getSchemaPath(ResponseRealEstateTaxSummaryDetailDto),
          KO: getSchemaPath(
            ResponseCommunalWasteTaxSummaryDetailDto,
          ),
        },
      },
    },
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
  @Tiers(UserVerifyStateCognitoTierEnum.IdentityCard)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Get('get-tax-detail-by-year-and-type')
  async getTaxDetailByYear(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Query('year', ParseIntPipe) year: number,
    @Query('order', ParseIntPipe) order: number,
    @Query('type', new ParseEnumPipe(TaxType)) type: TaxType,
  ) {
    return this.taxService.getTaxDetail(baUser.birthNumber, year, type, order)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get all taxes (paid and not paid)',
  })
  @ApiResponse({
    status: 200,
    description: 'Load list of taxes by limit, default value 5',
    type: ResponseGetTaxesListDto,
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
  @Tiers(UserVerifyStateCognitoTierEnum.IdentityCard)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Get('taxes')
  async getTaxesList(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Query('type', new ParseEnumPipe(TaxType)) type: TaxType,
  ): Promise<ResponseGetTaxesListDto> {
    // TODO - pagination - but it will be issue after in year 2040 :D

    const response = await this.taxService.getListOfTaxesByBirthnumberAndType(
      baUser.birthNumber,
      type,
    )
    return response
  }
}
