import { ExtractJsonFromSlovenskoSkXmlErrorType } from 'forms-shared/slovensko-sk/extractJson'

import {
  ConvertErrorsEnum,
  ConvertErrorsResponseEnum,
} from './convert.errors.enum'

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
