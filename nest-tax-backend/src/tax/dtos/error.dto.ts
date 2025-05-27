export enum CustomErrorTaxTypesEnum {
  TAX_YEAR_OR_USER_NOT_FOUND = 'TAX_YEAR_OR_USER_NOT_FOUND',
  TAX_USER_NOT_FOUND = 'TAX_USER_NOT_FOUND',
  BIRTHNUMBER_NOT_EXISTS = 'BIRTHNUMBER_NOT_EXISTS',
  MISSING_INSTALLMENT_AMOUNTS = 'MISSING_INSTALLMENT_AMOUNTS',
}

export enum CustomErrorTaxTypesResponseEnum {
  TAX_YEAR_OR_USER_NOT_FOUND = 'Tax year or user was not found',
  TAX_USER_NOT_FOUND = 'Tax user was not found',
  BIRTHNUMBER_NOT_EXISTS = 'Birthnumber not exists',
  MISSING_INSTALLMENT_AMOUNTS = 'Missing one or more installment amount',
}

export enum CustomErrorPdfCreateTypesEnum {
  PDF_CREATE_ERROR = 'PDF_CREATE_ERROR',
}
