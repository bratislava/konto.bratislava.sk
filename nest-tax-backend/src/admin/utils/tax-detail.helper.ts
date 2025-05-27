import { TaxDetailareaType } from '@prisma/client'
import currency from 'currency.js'

import { NorisTaxPayersDto } from '../../noris/noris.dto'

export enum AreaTypesEnum {
  APARTMENT = 'APARTMENT',
  CONSTRUCTION = 'CONSTRUCTION',
  GROUND = 'GROUND',
}

const config: Record<
  string,
  {
    areaType: AreaTypesEnum
    base: string
    amount: string
    area: string | false
    types: TaxDetailareaType[]
  }
> = {
  pozemky: {
    areaType: AreaTypesEnum.GROUND,
    base: 'ZAKLAD',
    amount: 'DAN',
    area: 'VYMERA',
    types: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  },
  stavba: {
    areaType: AreaTypesEnum.CONSTRUCTION,
    base: 'ZAKLAD',
    amount: 'DAN',
    area: false,
    types: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'jH', 'jI', 'H'],
  },
  byt: {
    areaType: AreaTypesEnum.APARTMENT,
    base: 'zaklad_dane',
    amount: 'dan_byty',
    area: false,
    types: ['byt', 'nebyt'],
  },
}

type TaxDetail = {
  taxId: number
  areaType: TaxDetailareaType
  type: AreaTypesEnum
  base: number
  amount: number
  area: string | null
}

export const taxDetail = (
  data: NorisTaxPayersDto,
  taxId: number,
): TaxDetail[] => {
  const response: TaxDetail[] = []

  Object.entries(config).forEach(([keyTaxConfig, valueTaxConfig]) => {
    valueTaxConfig.types.forEach((taxType) => {
      const prefix = keyTaxConfig === 'byt' ? 'det' : `det_${keyTaxConfig}`

      const baseKey =
        `${prefix}_${valueTaxConfig.base}_${taxType}` as keyof NorisTaxPayersDto
      const amountKey =
        `${prefix}_${valueTaxConfig.amount}_${taxType}` as keyof NorisTaxPayersDto

      const taxDetailItem: TaxDetail = {
        taxId,
        areaType: taxType,
        type: valueTaxConfig.areaType,
        base: currency((data[baseKey] as string).replace(',', '.')).intValue,
        amount: currency((data[amountKey] as string).replace(',', '.'))
          .intValue,
        area: valueTaxConfig.area
          ? (data[
              `${prefix}_${valueTaxConfig.area}_${taxType}` as keyof NorisTaxPayersDto
            ] as string)
          : null,
      }

      response.push(taxDetailItem)
    })
  })

  return response
}
