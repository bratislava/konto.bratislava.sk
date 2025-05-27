import { TaxFormData } from '../../types'
import { safeArray, safeString } from '../../../form-utils/safeData'

export const oslobodenieBooleanShared = (data: TaxFormData) => {
  const pozemkyArray = safeArray(data.znizenieAleboOslobodenieOdDane?.pozemky)
  const stavbyArray = safeArray(data.znizenieAleboOslobodenieOdDane?.stavby)
  const bytyArray = safeArray(data.znizenieAleboOslobodenieOdDane?.byty)

  return {
    pozemkyA: false,
    pozemkyB: pozemkyArray.includes('option1'),
    pozemkyC: pozemkyArray.includes('option2'),
    pozemkyD: false,
    pozemkyE: pozemkyArray.includes('option3'),
    pozemkyF: false,
    pozemkyG: false,
    pozemkyH: false,
    pozemkyI: false,
    pozemkyJ: false,
    pozemkyK: pozemkyArray.includes('option4'),
    pozemkyL: false,
    stavbyA: false,
    stavbyB: stavbyArray.includes('option1'),
    stavbyC: false,
    stavbyD: stavbyArray.includes('option2'),
    stavbyE: stavbyArray.includes('option3'),
    stavbyF: false,
    bytyA: false,
    bytyB: false,
    bytyC: false,
    bytyD: bytyArray.includes('option1'),
    bytyE: bytyArray.includes('option2'),
  }
}

export const oslobodenieShared = (data: TaxFormData) => ({
  obec: 'Bratislava',
  ...oslobodenieBooleanShared(data),
  poznamka: safeString(data.znizenieAleboOslobodenieOdDane?.poznamka),
})

export const zobrazitOslobodenie = (data: TaxFormData) => {
  const oslobodenieAnyChecked = Object.values(oslobodenieBooleanShared(data)).includes(true)
  const oslobodeniePoznamka = oslobodenieShared(data).poznamka
  const oslobodeniePoznamkaNonEmpty = oslobodeniePoznamka && oslobodeniePoznamka.trim() !== ''

  return oslobodenieAnyChecked || oslobodeniePoznamkaNonEmpty
}
