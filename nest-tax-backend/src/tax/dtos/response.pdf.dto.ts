class TaxInstallmentToPdfDto {
  text: string | null

  amount: string
}

export class RealEstateTaxTotalsToPdfDto {
  total: string

  taxFlat: string

  taxConstructions: string

  taxLand: string

  taxInstallments: TaxInstallmentToPdfDto[]
}
