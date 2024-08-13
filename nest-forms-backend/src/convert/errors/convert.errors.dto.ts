import { ApiProperty } from '@nestjs/swagger'

import { BadRequestErrorDto } from '../../utils/global-dtos/errors.dto'
import {
  ConvertErrorsEnum,
  ConvertErrorsResponseEnum,
} from './convert.errors.enum'

export class PdfGenerationFailedErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: ConvertErrorsEnum.PDF_GENERATION_FAILED,
    default: ConvertErrorsEnum.PDF_GENERATION_FAILED,
  })
  declare errorName: string

  @ApiProperty({
    example: ConvertErrorsResponseEnum.PDF_GENERATION_FAILED,
    default: ConvertErrorsResponseEnum.PDF_GENERATION_FAILED,
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
