import { oddiel2 } from './tax-pdf-mapping/oddiel2'
import { oddiel3JedenUcel } from './tax-pdf-mapping/oddiel3JedenUcel'
import { oddiel3ViacereUcely } from './tax-pdf-mapping/oddiel3ViacereUcely'
import { oddiel4 } from './tax-pdf-mapping/oddiel4'
import { oslobodenie } from './tax-pdf-mapping/oslobodenie'
import { poznamka } from './tax-pdf-mapping/poznamka'
import { prilohy } from './tax-pdf-mapping/prilohy'
import { udajeODanovnikovi } from './tax-pdf-mapping/udajeODanovnikovi'
import { TaxFormData, TaxPdfMapping } from './types'

// eslint-disable-next-line import/prefer-default-export
export const taxPdfMapping = (
  data: TaxFormData,
  formId?: string,
): TaxPdfMapping => ({
  ...udajeODanovnikovi(data),
  ...poznamka(data, formId),
  ...prilohy(data),
  ...oddiel2(data),
  ...oddiel3JedenUcel(data),
  ...oddiel3ViacereUcely(data),
  ...oddiel4(data),
  ...oslobodenie(data),
})
