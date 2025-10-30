import {
  Controller,
  Get,
  HttpCode,
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
import pdf, { CreateOptions } from 'html-pdf'

import { BratislavaUser } from '../auth/decorators/user-info.decorator'
import { TiersGuard } from '../auth/guards/tiers.guard'
import { Tiers } from '../utils/decorators/tier.decorator'
import { BratislavaUserDto } from '../utils/global-dtos/city-account.dto'
import { CognitoTiersEnum } from '../utils/global-dtos/cognito.dto'
import {
  ResponseErrorDto,
  ResponseInternalServerErrorDto,
} from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { CustomErrorPdfCreateTypesEnum } from './dtos/error.dto'
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
    description: 'Return pdf',
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
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Get('get-tax-pdf-by-year')
  async getTaxByYearPdf(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Query('year', ParseIntPipe) year: number,
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
}
