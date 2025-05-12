import { TaxPaidStatusEnum } from '../../dtos/response.tax.dto'
import { TaxInstallment } from '@prisma/client'

export const getTaxStatus = (
  desiredPayment: number,
  alreadyPaid: number | undefined,
): TaxPaidStatusEnum => {
  if (!alreadyPaid) return TaxPaidStatusEnum.NOT_PAID
  if (alreadyPaid === 0) return TaxPaidStatusEnum.NOT_PAID
  if (alreadyPaid > desiredPayment) return TaxPaidStatusEnum.OVER_PAID
  if (alreadyPaid === desiredPayment) return TaxPaidStatusEnum.PAID
  return TaxPaidStatusEnum.PARTIALLY_PAID
}

export const fixInstallmentTexts = (
  taxInstallments: TaxInstallment[],
  year: number,
): TaxInstallment[] => {
  return taxInstallments.map((taxInstallment, i) => {
    if (i === 1) {
      return {
        ...taxInstallment,
        text: `- druhá splátka v termíne do 31.08.${year} v sume:`,
      }
    }
    if (i === 2) {
      return {
        ...taxInstallment,
        text: `- tretia splátka v termíne do 31.10.${year} v sume:`,
      }
    }
    return taxInstallment
  })
}
