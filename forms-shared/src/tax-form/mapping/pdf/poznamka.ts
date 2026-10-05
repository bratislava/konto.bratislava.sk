import { TaxFormData } from '../../types'
import { poznamkaShared } from '../shared/poznamkaShared'

export const poznamka = (data: TaxFormData, formId?: string) => {
  const mapping = poznamkaShared(data, formId)

  return {
    '2_Poznamka': mapping.poznamka,
  }
}
