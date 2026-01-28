import { TaxType } from '@prisma/client'

export interface PaymentGateURLGeneratorDto {
  amount: number
  taxId: number
  description: string
  taxType: TaxType
}
