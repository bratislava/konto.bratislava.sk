import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { ResponseInternalServerErrorDto } from '../utils/guards/dtos/error.dto'
import { TurnstileSubservice } from '../utils/subservices/turnstile.subservice'
import { TowingSearchRequestDto, TowingSearchResponseDto } from './dtos/towing.dto'
import { TowingService } from './towing.service'

@ApiTags('Towing')
@Controller('towing')
export class TowingController {
  constructor(
    private readonly towingService: TowingService,
    private readonly turnstileSubservice: TurnstileSubservice
  ) {}

  @Post('public/:ecv')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Public lookup of an active towing / relocation by license plate',
    description:
      'Proxies `GET /api/public/tow/:ecv` from `nest-enforcement-backend`. ECV validation and ' +
      'normalization are owned by the upstream service. The path parameter is forwarded to upstream. ' +
      'A valid Turnstile token must be supplied in request body to mitigate enumeration attacks.',
  })
  @ApiOkResponse({ type: TowingSearchResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Invalid Turnstile token or upstream rejected the license plate.',
    type: ResponseInternalServerErrorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No active towing or relocation found for the given license plate.',
    type: ResponseInternalServerErrorDto,
  })
  @ApiResponse({
    status: 502,
    description: 'Enforcement backend returned an unexpected response.',
    type: ResponseInternalServerErrorDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Enforcement backend is currently unreachable. Try again later.',
    type: ResponseInternalServerErrorDto,
  })
  async getPublicTowingByEcv(
    @Param('ecv') ecv: string,
    @Body() body: TowingSearchRequestDto
  ): Promise<TowingSearchResponseDto> {
    await this.turnstileSubservice.validateToken(body.turnstileToken)
    return this.towingService.getPublicTowingByEcv(ecv)
  }
}
