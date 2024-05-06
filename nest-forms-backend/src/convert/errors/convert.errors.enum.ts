export enum ConvertErrorsEnum {
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  UNPROCESSABLE_TYPE = 'UNPROCESSABLE_TYPE',
  PUPPETEER_FORM_NOT_FOUND = 'PUPPETEER_FORM_NOT_FOUND',
  PUPPETEER_PAGE_FAILED_LOAD = 'PUPPETEER_PAGE_FAILED_LOAD',
  INVALID_JWT_TOKEN = 'INVALID_JWT_TOKEN',
  INVALID_UUID = 'INVALID_UUID',
  FORM_ID_MISSING = 'FORM_ID_MISSING',
}

export enum ConvertErrorsResponseEnum {
  ELEMENT_NOT_FOUND = 'An element was not found during the conversion.',
  UNPROCESSABLE_TYPE = 'Found an unprocessable type.',
  PUPPETEER_FORM_NOT_FOUND = 'Form was not found during browsing puppeteer instance.',
  PUPPETEER_PAGE_FAILED_LOAD = 'Page failed to load.',
  INVALID_JWT_TOKEN = 'Invalid jwt token.',
  INVALID_UUID = 'Invalid uuid.',
  FORM_ID_MISSING = 'Form id is required when not providing form json data.',
}
