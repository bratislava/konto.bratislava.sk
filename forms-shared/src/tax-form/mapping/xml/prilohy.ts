import { poznamkaShared } from '../shared/poznamkaShared'
import { prilohyShared } from '../shared/prilohyShared'
import { TaxFormData } from '../../types'

export const prilohyXml = (data: TaxFormData) => {
  const mapping = prilohyShared(data)
  const { poznamka } = poznamkaShared(data)

  return {
    SuhrnPriloh: {
      PocetOddielovII: mapping.oddiel2,
      PocetOddielovIII: mapping.oddiel3,
      PocetOddielovIV: mapping.oddiel4,
      PocetOddielovV: 0,
      PocetOddielovVI: 0,
      PocetOddielovVII: 0,
      PocetInych: mapping.zobrazitOslobodenie ? 1 : 0,
      Poznamka: poznamka,
    },
  }
}
