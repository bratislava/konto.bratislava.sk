export enum CustomErrorTaxTypesEnum {
  TAX_YEAR_OR_USER_NOT_FOUND = 'TAX_YEAR_OR_USER_NOT_FOUND',
  TAX_USER_NOT_FOUND = 'TAX_USER_NOT_FOUND',
  BIRTHNUMBER_NOT_EXISTS = 'BIRTHNUMBER_NOT_EXISTS',
  MISSING_INSTALLMENT_AMOUNTS = 'MISSING_INSTALLMENT_AMOUNTS',
  INSTALLMENT_INCORRECT_COUNT = 'INSTALLMENT_INCORRECT_COUNT',
  INSTALLMENT_UNEXPECTED_ERROR = 'INSTALLMENT_UNEXPECTED_ERROR',
  STATE_HOLIDAY_NOT_EXISTS = 'STATE_HOLIDAY_NOT_EXISTS',
}

export enum CustomErrorTaxTypesResponseEnum {
  TAX_YEAR_OR_USER_NOT_FOUND = 'Tax year or user was not found',
  TAX_USER_NOT_FOUND = 'Tax user was not found',
  BIRTHNUMBER_NOT_EXISTS = 'Birthnumber not exists',
  MISSING_INSTALLMENT_AMOUNTS = 'Missing one or more installment amount',
  INSTALLMENT_INCORRECT_COUNT = 'Number of installments does not equal 3.',
  INSTALLMENT_UNEXPECTED_ERROR = 'An unexpected error occurred while calculating installments.',
  STATE_HOLIDAY_NOT_EXISTS = 'State holidays are not configured for this or the next year.',
}

export enum CustomErrorPdfCreateTypesEnum {
  PDF_CREATE_ERROR = 'PDF_CREATE_ERROR',
}
