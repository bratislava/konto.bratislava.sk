import { TaxType } from '../../../prisma/generated/prisma/enums'

export interface PaymentGateURLGeneratorDto {
  amount: number
  taxId: number
  description: string
  taxType: TaxType
}
