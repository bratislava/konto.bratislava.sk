import { ApiProperty } from '@nestjs/swagger'
import { ExtractJsonFromSlovenskoSkXmlErrorType } from 'forms-shared/slovensko-sk/extractJson'

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

export class InvalidXmlErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: ConvertErrorsEnum.INVALID_XML,
    default: ConvertErrorsEnum.INVALID_XML,
  })
  declare errorName: string

  @ApiProperty({
    example: ConvertErrorsResponseEnum.INVALID_XML,
    default: ConvertErrorsResponseEnum.INVALID_XML,
  })
  declare message: string
}

export class XmlDoesntMatchSchemaErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: ConvertErrorsEnum.XML_DOESNT_MATCH_SCHEMA,
    default: ConvertErrorsEnum.XML_DOESNT_MATCH_SCHEMA,
  })
  declare errorName: string

  @ApiProperty({
    example: ConvertErrorsResponseEnum.XML_DOESNT_MATCH_SCHEMA,
    default: ConvertErrorsResponseEnum.XML_DOESNT_MATCH_SCHEMA,
  })
  declare message: string
}

export class WrongPospIdErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: ConvertErrorsEnum.WRONG_POSP_ID,
    default: ConvertErrorsEnum.WRONG_POSP_ID,
  })
  declare errorName: string

  @ApiProperty({
    example: ConvertErrorsResponseEnum.WRONG_POSP_ID,
    default: ConvertErrorsResponseEnum.WRONG_POSP_ID,
  })
  declare message: string
}

export class InvalidJsonErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: ConvertErrorsEnum.INVALID_JSON,
    default: ConvertErrorsEnum.INVALID_JSON,
  })
  declare errorName: string

  @ApiProperty({
    example: ConvertErrorsResponseEnum.INVALID_JSON,
    default: ConvertErrorsResponseEnum.INVALID_JSON,
  })
  declare message: string
}

export const extractJsonErrorMapping: Record<
  ExtractJsonFromSlovenskoSkXmlErrorType,
  { error: ConvertErrorsEnum; message: ConvertErrorsResponseEnum }
> = {
  [ExtractJsonFromSlovenskoSkXmlErrorType.InvalidXml]: {
    error: ConvertErrorsEnum.INVALID_XML,
    message: ConvertErrorsResponseEnum.INVALID_XML,
  },
  [ExtractJsonFromSlovenskoSkXmlErrorType.XmlDoesntMatchSchema]: {
    error: ConvertErrorsEnum.XML_DOESNT_MATCH_SCHEMA,
    message: ConvertErrorsResponseEnum.XML_DOESNT_MATCH_SCHEMA,
  },
  [ExtractJsonFromSlovenskoSkXmlErrorType.WrongPospId]: {
    error: ConvertErrorsEnum.WRONG_POSP_ID,
    message: ConvertErrorsResponseEnum.WRONG_POSP_ID,
  },
  [ExtractJsonFromSlovenskoSkXmlErrorType.InvalidJson]: {
    error: ConvertErrorsEnum.INVALID_JSON,
    message: ConvertErrorsResponseEnum.INVALID_JSON,
  },
}
