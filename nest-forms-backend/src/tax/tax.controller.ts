import { Body, Controller, Logger, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { JsonConvertRequestDto } from '../convert/dtos/form.dto'
import { TaxSignerDataResponseDto } from './dtos/tax.dto'
import TaxService from './tax.service'

@Controller('tax')
@ApiTags('Tax')
export default class TaxController {
  private readonly logger: Logger

  constructor(private readonly taxService: TaxService) {
    this.logger = new Logger('TaxController')
  }

  // TODO needs much love, barebones to test E2E functionality ASAP
  @ApiOperation({
    summary: '',
    description:
      'Returns input data for ditec signer from JSON data and shcema version id',
  })
  @ApiResponse({
    status: 200,
    description: 'Valid data to be passed onto signer',
    type: TaxSignerDataResponseDto,
  })
  @Post('signer-data/:slug')
  async signerData(
    @Body() data: JsonConvertRequestDto,
    @Param('slug') slug: string,
  ): Promise<TaxSignerDataResponseDto> {
    // TODO remove try-catch & extra logging once we start logging requests
    try {
      return this.taxService.getSignerData(data.jsonForm, slug)
    } catch (error) {
      this.logger.log(
        `Error during signerData, slug: ${slug}, data: ${JSON.stringify(data.jsonForm)}`,
      )
      throw error
    }
  }
}
