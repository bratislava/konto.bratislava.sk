import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthenticationGuard } from '@nestjs-cognito/auth'
import { BratislavaUser } from '../auth/decorators/user-info.decorator'
import { TiersGuard } from 'src/auth/guards/tiers.guard'
import { Tiers } from 'src/utils/decorators/tier.decorator'
import { CognitoTiersEnum } from 'src/utils/global-dtos/cognito.dto'

import { BratislavaUserDto } from '../utils/global-dtos/city-account.dto'
import { TaxService } from './tax.service'

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
    // type: TODO,
  })
  // TODO errors
  @Tiers(CognitoTiersEnum.IDENTITY_CARD)
  @UseGuards(TiersGuard)
  @UseGuards(AuthenticationGuard)
  @Get('get-tax-detail-by-year')
  async getTaxDetailByYear(
    @BratislavaUser() baUser: BratislavaUserDto,
    @Query('year') year: number,
  ) {
    // TODO
  }
}
