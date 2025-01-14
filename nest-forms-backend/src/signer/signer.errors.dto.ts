import { ApiProperty } from '@nestjs/swagger'

import { BadRequestErrorDto } from '../utils/global-dtos/errors.dto'
import {
  SignerErrorsEnum,
  SignerErrorsResponseEnum,
} from './signer.errors.enum'

// eslint-disable-next-line import/prefer-default-export
export class XmlValidationErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: SignerErrorsEnum.XML_VALIDATION_ERROR,
    default: SignerErrorsEnum.XML_VALIDATION_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: SignerErrorsResponseEnum.XML_VALIDATION_ERROR,
    default: SignerErrorsResponseEnum.XML_VALIDATION_ERROR,
  })
  declare message: string
}
