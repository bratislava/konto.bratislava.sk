import { ApiProperty } from '@nestjs/swagger'

import {
  BadRequestErrorDto,
  UnprocessableEntityErrorDto,
} from '../../utils/global-dtos/errors.dto'
import {
  ConvertErrorsEnum,
  ConvertErrorsResponseEnum,
} from './convert.errors.enum'

export class PuppeteerPageFailedLoadErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: ConvertErrorsEnum.PUPPETEER_PAGE_FAILED_LOAD,
    default: ConvertErrorsEnum.PUPPETEER_PAGE_FAILED_LOAD,
  })
  declare errorName: string

  @ApiProperty({
    example: ConvertErrorsResponseEnum.PUPPETEER_PAGE_FAILED_LOAD,
    default: ConvertErrorsResponseEnum.PUPPETEER_PAGE_FAILED_LOAD,
  })
  declare message: string
}

export class InvalidJwtTokenErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: ConvertErrorsEnum.INVALID_JWT_TOKEN,
    default: ConvertErrorsEnum.INVALID_JWT_TOKEN,
  })
  declare errorName: string

  @ApiProperty({
    example: ConvertErrorsResponseEnum.INVALID_JWT_TOKEN,
    default: ConvertErrorsResponseEnum.INVALID_JWT_TOKEN,
  })
  declare message: string
}

export class InvalidUuidErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: ConvertErrorsEnum.INVALID_UUID,
    default: ConvertErrorsEnum.INVALID_UUID,
  })
  declare errorName: string

  @ApiProperty({
    example: ConvertErrorsResponseEnum.INVALID_UUID,
    default: ConvertErrorsResponseEnum.INVALID_UUID,
  })
  declare message: string
}

export class FormIdMissingErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: ConvertErrorsEnum.FORM_ID_MISSING,
    default: ConvertErrorsEnum.FORM_ID_MISSING,
  })
  declare errorName: string

  @ApiProperty({
    example: ConvertErrorsResponseEnum.FORM_ID_MISSING,
    default: ConvertErrorsResponseEnum.FORM_ID_MISSING,
  })
  declare message: string
}
