import { Oddiel4PriznanieShared, oddiel4Shared } from '../shared/oddiel4Shared'
import { TaxFormData } from '../../types'
import { adresaStavbyBytu, katastralneUzemie, pravnyVztah, spoluvlastnictvo } from './ciselniky'
import { formatIntegerXml, formatXsDateXml } from './functions'
import { formatRodneCisloXml, sharedPriznanieXml } from './shared'

const mapPriznanie = (data: TaxFormData, priznanie: Oddiel4PriznanieShared, index: number) => ({
  PoradoveCislo: index + 1,
  ...sharedPriznanieXml(data),
  AdresaBytu: adresaStavbyBytu(priznanie),
  NazovKatastralnehoUzemia: katastralneUzemie(priznanie.katastralneUzemie),
  CisloParcely: priznanie.cisloParcely,
  // "Číslo bytu" might be legitimately empty, but the XSD validation expects it to be present
  CisloBytu: priznanie.byt?.cisloBytu ?? '',
  PravnyVztah: pravnyVztah(priznanie),
  Spoluvlastnictvo: spoluvlastnictvo(priznanie),
  RodneCisloManzelaAleboManzelky: formatRodneCisloXml(priznanie.rodneCisloManzelaManzelky),
  PocetSpoluvlastnikov: formatIntegerXml(priznanie.pocetSpoluvlastnikov),
  SpoluvlastnikUrcenyDohodou: priznanie.spoluvlastnikUrcenyDohodou,
  PopisBytu: priznanie.byt?.popisBytu,
  DatumVznikuDanovejPovinnosti: formatXsDateXml(priznanie.byt?.datumVznikuDanovejPovinnosti),
  DatumZanikuDanovejPovinnosti: formatXsDateXml(priznanie.byt?.datumZanikuDanovejPovinnosti),
  NebytovePriestory: {
    NebytovyPriestor: priznanie.nebytovePriestory.map(
      (nebytovyPriestor, nebytovyPriestorIndex) => ({
        PoradoveCislo: nebytovyPriestorIndex + 1,
        CisloVBytovomDome: nebytovyPriestor.cisloNebytovehoPriestoruVBytovomDome,
        UcelVyuzitiaVBytovomDome: nebytovyPriestor.ucelVyuzitiaNebytovehoPriestoruVBytovomDome,
        VymeraPodlahovychPloch: formatIntegerXml(
          nebytovyPriestor.vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome,
        ),
        DatumVznikuDanovejPovinnosti: formatXsDateXml(
          nebytovyPriestor.datumVznikuDanovejPovinnosti,
        ),
        DatumZanikuDanovejPovinnosti: formatXsDateXml(
          nebytovyPriestor.datumZanikuDanovejPovinnosti,
        ),
      }),
    ),
  },
  ZakladDane: {
    // "Základ dane bytu" might be legitimately empty, but the XSD validation expects it to be present
    Byt: formatIntegerXml(priznanie.byt?.zakladDane ?? 0),
  },
  VymeraPodlahovejPlochyVyuzivanejNaIneUcely: formatIntegerXml(
    priznanie.byt?.vymeraPodlahovejPlochyNaIneUcely,
  ),
  // We don't provide VymeraPlochOslobodenychOdDane
  Poznamka: priznanie.poznamka,
})

export const oddiel4Xml = (data: TaxFormData) => {
  const mapping = oddiel4Shared(data)

  if (mapping.length === 0) {
    return null
  }

  return {
    DanZBytovANebytovychPriestorov: {
      DanZBytovANebytovychPriestorovZaznam: mapping.map((priznanie, index) =>
        mapPriznanie(data, priznanie, index),
      ),
    },
  }
}
