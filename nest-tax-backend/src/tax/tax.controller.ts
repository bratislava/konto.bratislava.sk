import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
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
import pdf, { CreateOptions } from 'html-pdf'
import { UserVerifyStateCognitoTierEnum } from 'openapi-clients/city-account'

import { BratislavaUser } from '../auth/decorators/user-info.decorator'
import { TiersGuard } from '../auth/guards/tiers.guard'
import { Tiers } from '../utils/decorators/tier.decorator'
import { BratislavaUserDto } from '../utils/global-dtos/city-account.dto'
import {
  ResponseErrorDto,
  ResponseInternalServerErrorDto,
} from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { CustomErrorPdfCreateTypesEnum } from './dtos/error.dto'
import { ResponseGetTaxesDto, ResponseTaxDto } from './dtos/response.tax.dto'
import { TaxService } from './tax.service'

@ApiTags('tax')
@ApiBearerAuth()
@Controller('tax')
export class TaxController {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly taxService: TaxService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice(TaxController.name)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get tax by year and how much is paid',
  })
  @ApiResponse({
    status: 200,
    description: 'Load tax data about user',
    type: ResponseTaxDto,
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
  @Get('get-tax-by-year-and-type')
  async getActualTaxes(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Query('year', ParseIntPipe) year: number,
    @Query('type', new ParseEnumPipe(TaxType)) type: TaxType,
  ): Promise<ResponseTaxDto> {
    return this.taxService.getTaxByYearAndType(year, baUser.birthNumber, type)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get tax by year and how much is paid',
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Return pdf',
    type: ResponseTaxDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Error generate pdf',
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
  @Get('get-tax-pdf-by-year')
  async getTaxByYearPdf(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Query('year', ParseIntPipe) year: number,
    @Query('type', new ParseEnumPipe(TaxType)) type: TaxType,
    @Res() res: any,
  ) {
    try {
      const pdfData = await this.taxService.generatePdf(
        year,
        baUser.birthNumber,
        type,
      )
      const options: CreateOptions = {
        format: 'A4',
        border: {
          top: '30px',
          right: '30px',
          bottom: '30px',
          left: '30px',
        },
      }
      pdf.create(pdfData, options).toBuffer((err, buffer) => {
        if (err) {
          this.logger.error(err)
        } else {
          res.header('Content-type', 'application/pdf')
          res.send(buffer)
        }
      })
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        CustomErrorPdfCreateTypesEnum.PDF_CREATE_ERROR,
        'Error to create pdf',
        'Error to create pdf',
        undefined,
        error,
      )
    }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get all taxes (paid and not paid)',
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Load list of taxes by limit, default value 5',
    type: ResponseGetTaxesDto,
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
  @Get('taxes/:type')
  async getArchivedTaxes(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Param('type', new ParseEnumPipe(TaxType)) type: TaxType,
  ): Promise<ResponseGetTaxesDto> {
    // TODO - pagination - but it will be issue after in year 2040 :D
    const response = await this.taxService.loadTaxes(baUser.birthNumber, type)
    return response
  }
}
