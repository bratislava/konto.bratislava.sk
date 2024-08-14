import { ApiProperty } from '@nestjs/swagger'

import { BadRequestErrorDto } from '../../utils/global-dtos/errors.dto'
import {
  ConvertErrorsEnum,
  ConvertErrorsResponseEnum,
} from './convert.errors.enum'

// eslint-disable-next-line import/prefer-default-export
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
