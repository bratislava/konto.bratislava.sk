export enum ConvertErrorsEnum {
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  UNPROCESSABLE_TYPE = 'UNPROCESSABLE_TYPE',
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
  FORM_ID_MISSING = 'FORM_ID_MISSING',
}

export enum ConvertErrorsResponseEnum {
  ELEMENT_NOT_FOUND = 'An element was not found during the conversion.',
  UNPROCESSABLE_TYPE = 'Found an unprocessable type.',
  PDF_GENERATION_FAILED = 'PDF generation failed.',
  FORM_ID_MISSING = 'Form id is required when not providing form json data.',
}
