import { IsNotEmpty } from 'class-validator'

export interface PaymentConfig {
  url: string
  merchantNumber: string
  currency: string
  publicKeyPath: string
  privateKeyPath: string
  privateKeyPassword: string
}

export interface CreateOrderData {
  MERCHANTNUMBER: string
  OPERATION: string
  ORDERNUMBER: string | number
  AMOUNT: string
  CURRENCY: string | number
  DEPOSITFLAG: string | number
  URL: string
  DESCRIPTION?: string
  EMAIL?: string
  PAYMETHODS?: string
}

export interface SignedOrderData extends CreateOrderData {
  DIGEST: string
}

export enum PaymentErrorStatus {
  techProblem = 'technical-problem',
  paymentDenied = 'payment-denied',
  incorrectData = 'incorrect-data',
  unknownError = 'unknown-error',
}

export class PaymentResponseQueryDto {
  @IsNotEmpty() OPERATION!: string

  @IsNotEmpty() ORDERNUMBER!: string

  @IsNotEmpty() PRCODE!: string

  @IsNotEmpty() SRCODE!: string

  @IsNotEmpty() DIGEST!: string

  @IsNotEmpty() DIGEST1!: string

  @IsNotEmpty() RESULTTEXT!: string
}
