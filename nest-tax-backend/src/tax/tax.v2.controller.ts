import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common'
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
  ResponseErrorDto,
  ResponseInternalServerErrorDto,
} from 'src/utils/guards/dtos/error.dto'
import ThrowerErrorGuard from 'src/utils/guards/errors.guard'

import { BratislavaUserDto } from '../utils/global-dtos/city-account.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { TaxService } from './tax.service'
import { TaxSummaryDetail } from './dtos/response.pdf.dto'

@ApiTags('tax')
@ApiBearerAuth()
@Controller({ path: 'tax', version: '2' })
export class TaxControllerV2 {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly taxService: TaxService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice(TaxControllerV2.name)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get tax detail.',
  })
  @ApiResponse({
    status: 200,
    description: 'TODO', // TODO add description
    type: TaxSummaryDetail,
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
  // TODO errors
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Get('tax-detail')
  async getTaxDetail(@BratislavaUser() baUser: BratislavaUserDto) {
    return this.taxService.getTaxDetail(baUser.birthNumber)
  }
}
