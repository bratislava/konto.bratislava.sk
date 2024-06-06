import { Body, Controller, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import {
  JsonConvertRequestDto,
} from '../convert/dtos/form.dto'
import {
  TaxJsonToXmlRequestDto,
  TaxJsonToXmlResponseDto,
  TaxSignerDataResponseDto,
} from './dtos/tax.dto'
import TaxService from './tax.service'

@Controller('tax')
@ApiTags('Tax')
export default class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @ApiOperation({
    summary: '',
    description: 'Generates XML for tax form from given JSON data',
  })
  @ApiResponse({
    status: 200,
    description: 'Return XML form',
    type: String,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Form data are empty or invalid',
  })
  @Post('json-to-xml')
  async convertJsonToXml(
    @Body() data: TaxJsonToXmlRequestDto,
  ): Promise<TaxJsonToXmlResponseDto> {
    return {
      xmlForm: this.taxService.convertJsonToXml(data.jsonForm),
    }
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
  @Post('signer-data')
  async signerData(
    @Body() data: JsonConvertRequestDto,
  ): Promise<TaxSignerDataResponseDto> {
    return this.taxService.getSignerData(data.jsonForm)
  }
}
