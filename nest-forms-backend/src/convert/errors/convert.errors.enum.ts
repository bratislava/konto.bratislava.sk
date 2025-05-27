export enum ConvertErrorsEnum {
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
  INVALID_XML = 'INVALID_XML',
  XML_DOESNT_MATCH_SCHEMA = 'XML_DOESNT_MATCH_SCHEMA',
  WRONG_POSP_ID = 'WRONG_POSP_ID',
  INVALID_JSON = 'INVALID_JSON',
  INCOMPATIBLE_JSON_VERSION = 'INCOMPATIBLE_JSON_VERSION',
}

export enum ConvertErrorsResponseEnum {
  PDF_GENERATION_FAILED = 'PDF generation failed.',
  INVALID_XML = 'The provided XML is invalid.',
  XML_DOESNT_MATCH_SCHEMA = 'The XML does not match the expected schema.',
  WRONG_POSP_ID = 'The XML contains an incorrect POSP ID.',
  INVALID_JSON = 'The extracted JSON is invalid.',
  INCOMPATIBLE_JSON_VERSION = 'The JSON version is incompatible.',
}
