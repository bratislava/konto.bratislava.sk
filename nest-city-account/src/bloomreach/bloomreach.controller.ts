import { Controller, Get, HttpCode, Param, Res } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { Response } from 'express'
import { ResponseInternalServerErrorDto } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { BloomreachErrorEnum, BloomreachErrorResponseEnum } from './bloomreach.error.enum'
import { BloomreachService } from './bloomreach.service'

@Controller('bloomreach')
export class BloomreachController {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly bloomreachService: BloomreachService
  ) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get tax notification agreement PDF by hash.',
  })
  @ApiQuery({
    name: 'hash',
    required: true,
    description: 'Unique hash that corresponds to a PDF file',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'PDF file with tax notification agreement.',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Hash parameter is missing or invalid',
    type: ResponseInternalServerErrorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'PDF not found for the provided hash',
    type: ResponseInternalServerErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @Get('get-notify-agreement-pdf/:hash')
  async getPdfByHash(@Param('hash') hash: string, @Res() res: Response) {
    if (!hash) {
      throw this.throwerErrorGuard.BadRequestException(
        BloomreachErrorEnum.HASH_NOT_PROVIDED,
        BloomreachErrorResponseEnum.HASH_NOT_PROVIDED
      )
    }

    const file = await this.bloomreachService.getFileByHash(hash)
    // Set response headers for PDF
    res.setHeader('Content-Type', file.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`)

    res.send(file.data)
  }
}
