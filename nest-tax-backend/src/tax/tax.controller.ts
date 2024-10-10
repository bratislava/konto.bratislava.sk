import {
  Controller,
  Get,
  HttpCode,
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
import pdf, { CreateOptions } from 'html-pdf'
import { BratislavaUser } from 'src/auth/guards/cognito.guard'
import { TiersGuard } from 'src/auth/guards/tiers.guard'
import { Tiers } from 'src/utils/decorators/tier.decorator'
import { CognitoTiersEnum } from 'src/utils/global-dtos/cognito.dto'
import {
  ResponseCustomCreatePdfErrorDto,
  ResponseCustomTaxErrorDto,
  ResponseInternalServerErrorDto,
} from 'src/utils/guards/dtos/error.dto'
import { ErrorThrowerGuard } from 'src/utils/guards/errors.guard'

import { ResponseUserDataDto } from '../generated-clients/nest-city-account'
import { ResponseGetTaxesDto, ResponseTaxDto } from './dtos/requests.tax.dto'
import { TaxService } from './tax.service'

@ApiTags('tax')
@ApiBearerAuth()
@Controller('tax')
export class TaxController {
  constructor(
    private taxService: TaxService,
    private errorThrowerGuard: ErrorThrowerGuard,
  ) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get tax by year and how much is payed',
  })
  @ApiResponse({
    status: 200,
    description: 'Load tax data about user',
    type: ResponseTaxDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Error to load tax data',
    type: ResponseCustomTaxErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Get('get-tax-by-year')
  async getActualTaxes(
    @BratislavaUser() baUser: ResponseUserDataDto,
    @Query('year') year: number,
  ): Promise<ResponseTaxDto> {
    return this.taxService.getTaxByYear(year, baUser.birthNumber)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get tax by year and how much is payed',
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
    type: ResponseCustomCreatePdfErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Get('get-tax-pdf-by-year')
  async getTaxByYearPdf(
    @BratislavaUser() baUser: ResponseUserDataDto,
    @Query('year') year: number,
    @Res() res: any,
  ) {
    try {
      const pdfData = await this.taxService.generatePdf(
        year,
        baUser.birthNumber,
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
          console.error(err)
        } else {
          res.header('Content-type', 'application/pdf')
          res.send(buffer)
        }
      })
    } catch (error) {
      this.errorThrowerGuard.renderPdfError(error)
    }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get all taxes (payed and not payed)',
  })
  @ApiResponse({
    status: 200,
    description: 'Load list of taxes by limit, default value 5',
    type: ResponseGetTaxesDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Error to load tax data',
    type: ResponseCustomTaxErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Get('taxes')
  async getArchivedTaxes(
    @BratislavaUser() baUser: ResponseUserDataDto,
  ): Promise<ResponseGetTaxesDto> {
    // TODO - pagination - but it will be issue after in year 2040 :D
    const response = await this.taxService.loadTaxes(baUser.birthNumber)
    return response
  }
}
