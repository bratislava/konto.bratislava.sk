import { DanZBytovANebytovychPriestorovPriznanie, TaxFormData } from '../../types'
import { parseDateFieldDate } from './functions'
import { oddielBaseShared } from './oddielBaseShared'
import { calculateTaxCalculatorFormula } from '../../calculators'
import { safeArray, safeBoolean, safeNumber, safeString } from '../../../form-utils/safeData'

const zakladDaneFormula = `denominator = ratioDenominator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu);
                      highestPowerOf10 = pow(10, floor(log10 denominator));
                      isSpecialCase = denominator >= 1000 and denominator % highestPowerOf10 == 0;
                      ceil ((isSpecialCase ? celkovaVymeraSpecialCase : ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) / 100) * evalRatio(spoluvlastnickyPodiel))`

const pouzitKalkulacku = (data: TaxFormData) =>
  safeBoolean(data.danZBytovANebytovychPriestorov?.kalkulackaWrapper?.pouzitKalkulacku) === true

const priznanieZaBytMapping = (
  data: TaxFormData,
  priznanie: DanZBytovANebytovychPriestorovPriznanie,
) => {
  if (safeBoolean(priznanie?.priznanieZaByt?.priznanieZaByt) !== true) {
    return null
  }

  const zakladDane = pouzitKalkulacku(data)
    ? calculateTaxCalculatorFormula(zakladDaneFormula, priznanie?.priznanieZaByt ?? {})
    : safeNumber(priznanie?.priznanieZaByt?.vymeraPodlahovejPlochyBytu)

  return {
    cisloBytu: safeString(priznanie?.priznanieZaByt?.cisloBytu),
    popisBytu: safeString(priznanie?.priznanieZaByt?.popisBytu),
    datumVznikuDanovejPovinnosti: parseDateFieldDate(
      priznanie?.priznanieZaByt?.datumy?.datumVznikuDanovejPovinnosti,
    ),
    datumZanikuDanovejPovinnosti: parseDateFieldDate(
      priznanie?.priznanieZaByt?.datumy?.datumZanikuDanovejPovinnosti,
    ),
    zakladDane,
    vymeraPodlahovejPlochyNaIneUcely: safeNumber(
      priznanie.priznanieZaByt?.vymeraPodlahovejPlochyNaIneUcely,
    ),
  }
}

const priznanieZaNebytovePriestoryMapping = (
  data: TaxFormData,
  priznanie: DanZBytovANebytovychPriestorovPriznanie,
) => {
  if (safeBoolean(priznanie?.priznanieZaNebytovyPriestor?.priznanieZaNebytovyPriestor) !== true) {
    return []
  }
  const nebytovePriestory = safeArray(
    priznanie.priznanieZaNebytovyPriestor?.nebytovePriestory,
  ).slice(0, 15)

  return nebytovePriestory.map((nebytovyPriestor) => {
    const vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome = pouzitKalkulacku(data)
      ? calculateTaxCalculatorFormula(zakladDaneFormula, nebytovyPriestor)
      : safeNumber(nebytovyPriestor?.vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome)

    return {
      cisloNebytovehoPriestoruVBytovomDome: safeString(
        nebytovyPriestor?.riadok?.cisloNebytovehoPriestoruVBytovomDome,
      ),
      ucelVyuzitiaNebytovehoPriestoruVBytovomDome: safeString(
        nebytovyPriestor?.riadok?.ucelVyuzitiaNebytovehoPriestoruVBytovomDome,
      ),
      datumVznikuDanovejPovinnosti: parseDateFieldDate(
        nebytovyPriestor?.datumy?.datumVznikuDanovejPovinnosti,
      ),
      datumZanikuDanovejPovinnosti: parseDateFieldDate(
        nebytovyPriestor?.datumy?.datumZanikuDanovejPovinnosti,
      ),
      vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome,
    }
  })
}

const mapPriznanie = (data: TaxFormData, priznanie: DanZBytovANebytovychPriestorovPriznanie) => {
  const cisloListuVlastnictva = safeString(priznanie.cisloListuVlastnictva)
  const poznamka = [
    safeString(priznanie.poznamka),
    cisloListuVlastnictva ? `Číslo LV: ${cisloListuVlastnictva}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    ...oddielBaseShared(data, priznanie, true),
    ulicaACisloDomu: safeString(priznanie?.riadok1?.ulicaACisloDomu),
    supisneCislo: safeNumber(priznanie?.riadok1?.supisneCislo),
    katastralneUzemie: safeString(priznanie?.riadok2?.kataster),
    cisloParcely: safeString(priznanie?.riadok2?.cisloParcely),
    byt: priznanieZaBytMapping(data, priznanie),
    nebytovePriestory: priznanieZaNebytovePriestoryMapping(data, priznanie),
    poznamka,
  }
}

export type Oddiel4PriznanieShared = ReturnType<typeof mapPriznanie>

export const oddiel4Shared = (data: TaxFormData) => {
  if (safeBoolean(data.danZBytovANebytovychPriestorov?.vyplnitObject?.vyplnit) !== true) {
    return [] as Oddiel4PriznanieShared[]
  }

  return safeArray(data.danZBytovANebytovychPriestorov?.priznania).map((priznanie) =>
    mapPriznanie(data, priznanie),
  )
}
