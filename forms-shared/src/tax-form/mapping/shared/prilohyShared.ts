import { TaxFormData } from '../../types'
import { getPocty } from './functions'
import { zobrazitOslobodenie } from './oslobodenieShared'

export const prilohyShared = (data: TaxFormData) => {
  const pocty = getPocty(data)

  return {
    oddiel2: pocty.pocetPozemkov,
    oddiel3: pocty.pocetStaviebJedenUcel + pocty.pocetStaviebViacereUcely,
    oddiel4: pocty.pocetBytov,
    zobrazitOslobodenie: zobrazitOslobodenie(data),
  }
}
