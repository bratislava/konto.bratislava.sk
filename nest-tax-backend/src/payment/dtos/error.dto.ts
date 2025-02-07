export enum CustomErrorPaymentResponseTypesEnum {
  PAYMENT_RESPONSE_ERROR = 'PAYMENT_RESPONSE_ERROR',
}

export enum CustomErrorPaymentTypesResponseEnum {
  OLD_TAX_NOT_PAYABLE = 'Tax is not payable, because tax is from past year.',
  QR_CODE_NOT_FOUND = 'QR code was not found',
}

export enum CustomErrorPaymentTypesEnum {
  TAX_NOT_FOUND = 'TAX_NOT_FOUND',
  PAYMENT_ALREADY_PAID = 'PAYMENT_ALREADY_PAID',
  OLD_TAX_NOT_PAYABLE = 'OLD_TAX_NOT_PAYABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CREATE_PAYMENT_URL = 'CREATE_PAYMENT_URL',
  QR_CODE_NOT_FOUND = 'QR_CODE_NOT_FOUND',
}
