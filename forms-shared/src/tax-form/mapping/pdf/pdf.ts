import { oddiel2 } from './oddiel2'
import { oddiel3JedenUcel } from './oddiel3JedenUcel'
import { oddiel3ViacereUcely } from './oddiel3ViacereUcely'
import { oddiel4 } from './oddiel4'
import { oslobodenie } from './oslobodenie'
import { poznamka } from './poznamka'
import { prilohy } from './prilohy'
import { udajeODanovnikovi } from './udajeODanovnikovi'
import { TaxFormData, TaxPdfMapping } from '../../types'

export const getTaxFormPdfMapping = (data: TaxFormData, formId?: string): TaxPdfMapping => ({
  ...udajeODanovnikovi(data),
  ...poznamka(data, formId),
  ...prilohy(data),
  ...oddiel2(data),
  ...oddiel3JedenUcel(data),
  ...oddiel3ViacereUcely(data),
  ...oddiel4(data),
  ...oslobodenie(data),
})
