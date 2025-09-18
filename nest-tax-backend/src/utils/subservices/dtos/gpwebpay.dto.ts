import { IsNotEmpty } from 'class-validator'

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

export class PaymentResponseQueryToVerifyDto {
  @IsNotEmpty() OPERATION!: string

  @IsNotEmpty() ORDERNUMBER!: string

  @IsNotEmpty() PRCODE!: string

  @IsNotEmpty() SRCODE!: string

  @IsNotEmpty() RESULTTEXT!: string
}

export class PaymentResponseQueryDto extends PaymentResponseQueryToVerifyDto {
  @IsNotEmpty() DIGEST!: string

  @IsNotEmpty() DIGEST1!: string
}
