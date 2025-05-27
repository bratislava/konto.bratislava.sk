import { esbsPredmetDaneCiselnik } from '../shared/esbsCiselniky'
import {
  Oddiel3JedenUcelPriznanieShared,
  oddiel3JedenUcelShared,
} from '../shared/oddiel3JedenUcelShared'
import { TaxFormData } from '../../types'
import {
  adresaStavbyBytu,
  getCiselnikEntryByCondition,
  katastralneUzemie,
  pravnyVztah,
  spoluvlastnictvo,
} from './ciselniky'
import { formatIntegerXml, formatXsDateXml } from './functions'
import { formatRodneCisloXml, sharedPriznanieXml } from './shared'

const mapPriznanie = (
  data: TaxFormData,
  priznanie: Oddiel3JedenUcelPriznanieShared,
  index: number,
) => ({
  PoradoveCislo: index + 1,
  ...sharedPriznanieXml(data),
  AdresaStavby: adresaStavbyBytu(priznanie),
  NazovKatastralnehoUzemia: katastralneUzemie(priznanie.katastralneUzemie),
  CisloParcely: priznanie.cisloParcely,
  PravnyVztah: pravnyVztah(priznanie),
  Spoluvlastnictvo: spoluvlastnictvo(priznanie),
  RodneCisloManzelaAleboManzelky: formatRodneCisloXml(priznanie.rodneCisloManzelaManzelky),
  PocetSpoluvlastnikov: formatIntegerXml(priznanie.pocetSpoluvlastnikov),
  SpoluvlastnikUrcenyDohodou: priznanie.spoluvlastnikUrcenyDohodou,
  DatumVznikuDanovejPovinnosti: formatXsDateXml(priznanie.datumVznikuDanovejPovinnosti),
  DatumZanikuDanovejPovinnosti: formatXsDateXml(priznanie.datumZanikuDanovejPovinnosti),
  PredmetDane: getCiselnikEntryByCondition(esbsPredmetDaneCiselnik, {
    '0': priznanie.predmetDane === 'a',
    '1': priznanie.predmetDane === 'b',
    '2': priznanie.predmetDane === 'c',
    '3': priznanie.predmetDane === 'd',
    '4': priznanie.predmetDane === 'e',
    '5': priznanie.predmetDane === 'f',
    '6': priznanie.predmetDane === 'g',
    '7': priznanie.predmetDane === 'h',
    '8': priznanie.predmetDane === 'i',
  }),
  ZakladDane: formatIntegerXml(priznanie.zakladDane),
  PocetPodlazi: formatIntegerXml(
    priznanie.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
  ),
  CelkovaVymeraPodlahovychPloch: formatIntegerXml(
    priznanie.celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby,
  ),
  Poznamka: priznanie.poznamka,
})

export const oddiel3JedenUcelXml = (data: TaxFormData) => {
  const mapping = oddiel3JedenUcelShared(data)

  if (mapping.length === 0) {
    return null
  }

  return {
    DanZoStaviebJedenUcel: {
      DanZoStaviebJedenUcelZaznam: mapping.map((priznanie, index) =>
        mapPriznanie(data, priznanie, index),
      ),
    },
  }
}
