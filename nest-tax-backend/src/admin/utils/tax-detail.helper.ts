/* eslint-disable sonarjs/cognitive-complexity */
// TODO
/* eslint-disable sonarjs/no-nested-template-literals */
/* eslint-disable no-restricted-syntax */
import currency from 'currency.js'

import { NorisTaxPayersDto } from '../../noris/noris.dto'

enum AreaTypesEnum {
  APARTMENT = 'APARTMENT',
  CONSTRUCTION = 'CONSTRUCTION',
  GROUND = 'GROUND',
}

const config = {
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

export const taxDetail = (data: NorisTaxPayersDto, taxId: number) => {
  const response = []
  for (const [keyTaxConfig, valueTaxConfig] of Object.entries(config)) {
    for (const taxType of valueTaxConfig.types) {
      response.push({
        taxId,
        areaType: taxType,
        type: valueTaxConfig.areaType,
        base: currency(
          data[
            `det${keyTaxConfig === 'byt' ? '' : `_${keyTaxConfig}`}_${
              valueTaxConfig.base
            }_${taxType}`
          ].replace(',', '.'),
        ).intValue,
        amount: currency(
          data[
            `det${keyTaxConfig === 'byt' ? '' : `_${keyTaxConfig}`}_${
              valueTaxConfig.amount
            }_${taxType}`
          ].replace(',', '.'),
        ).intValue,
        area: valueTaxConfig.area
          ? data[
              `det${keyTaxConfig === 'byt' ? '' : `_${keyTaxConfig}`}_${
                valueTaxConfig.area
              }_${taxType}`
            ]
          : null,
      })
    }
  }
  return response
}
