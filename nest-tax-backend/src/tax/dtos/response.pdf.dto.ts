type TaxInstallmentToPdf = {
  text: string | null

  amount: string
}

export type RealEstateTaxTotalsToPdf = {
  total: string

  taxFlat: string

  taxConstructions: string

  taxLand: string

  taxInstallments: TaxInstallmentToPdf[]
}
