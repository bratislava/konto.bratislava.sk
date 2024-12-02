import { ApiProperty } from '@nestjs/swagger'

export class ResponseInternalServerErrorDto {
  @ApiProperty({
    description: 'statusCode',
    default: 500,
  })
  statusCode: number

  @ApiProperty({
    description: 'Message about error',
    default: 'Internal server error',
  })
  message: string
}

export class ResponseCustomTaxErrorDto {
  statusCode: number

  status: string

  message: string

  errorName: CustomErrorTaxTypesEnum
}

export class ResponseCustomCreatePdfErrorDto {
  statusCode: number

  status: string

  message: string

  errorName: CustomErrorPdfCreateTypesEnum
}

export class ResponseCustomPaymentErrorDto {
  statusCode: number

  status: string

  message: string

  errorName: CustomErrorPaymentTypesEnum
}

export enum CustomErrorTaxTypesEnum {
  TAXYEAR_OR_USER_NOT_FOUND = 'TAXYEAR_OR_USER_NOT_FOUND',
}

export enum CustomErrorPaymentTypesEnum {
  TAX_NOT_FOUND = 'TAX_NOT_FOUND',
  PAYMENT_ALREADY_PAYED = 'PAYMENT_ALREADY_PAYED',
  OLD_TAX_NOT_PAYABLE = 'OLD_TAX_NOT_PAYABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CREATE_PAYMENT_URL = 'CREATE_PAYMENT_URL',
  QR_CODE_NOT_FOUND = 'QR_CODE_NOT_FOUND',
}

export enum CustomErrorPaymentResponseTypesEnum {
  PAYMENT_RESPONSE_ERROR = 'PAYMENT_RESPONSE_ERROR',
}

export enum CustomErrorPdfCreateTypesEnum {
  PDF_CREATE_ERROR = 'PDF_CREATE_ERROR',
}
