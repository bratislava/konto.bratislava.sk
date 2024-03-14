/* eslint-disable @typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair,import/prefer-default-export */
import { poznamkaShared } from '../shared/poznamkaShared'
import { TaxFormData } from '../../types'

export const poznamka = (data: TaxFormData, formId?: string) => {
  const mapping = poznamkaShared(data, formId)

  return {
    '2_Poznamka': mapping.poznamka,
  }
}
