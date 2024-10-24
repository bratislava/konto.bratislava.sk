import { TaxPaidStatusEnum } from 'src/tax/dtos/requests.tax.dto'

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
