export enum ConvertErrorsEnum {
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  UNPROCESSABLE_TYPE = 'UNPROCESSABLE_TYPE',
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
  INVALID_XML = 'INVALID_XML',
  XML_DOESNT_MATCH_SCHEMA = 'XML_DOESNT_MATCH_SCHEMA',
  WRONG_POSP_ID = 'WRONG_POSP_ID',
  INVALID_JSON = 'INVALID_JSON',
}

export enum ConvertErrorsResponseEnum {
  ELEMENT_NOT_FOUND = 'An element was not found during the conversion.',
  UNPROCESSABLE_TYPE = 'Found an unprocessable type.',
  PDF_GENERATION_FAILED = 'PDF generation failed.',
  INVALID_XML = 'The provided XML is invalid.',
  XML_DOESNT_MATCH_SCHEMA = 'The XML does not match the expected schema.',
  WRONG_POSP_ID = 'The XML contains an incorrect POSP ID.',
  INVALID_JSON = 'The extracted JSON is invalid.',
}
