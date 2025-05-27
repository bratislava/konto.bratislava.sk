import { esbsPredmetDaneCiselnik } from '../shared/esbsCiselniky'
import {
  Oddiel3ViacereUcelyPriznanieShared,
  oddiel3ViacereUcelyShared,
} from '../shared/oddiel3ViacereUcelyShared'
import { TaxFormData } from '../../types'
import { adresaStavbyBytu, katastralneUzemie, pravnyVztah, spoluvlastnictvo } from './ciselniky'
import { formatDecimalXml, formatIntegerXml, formatXsDateXml } from './functions'
import { formatRodneCisloXml, sharedPriznanieXml } from './shared'

const mapPriznanie = (
  data: TaxFormData,
  priznanie: Oddiel3ViacereUcelyPriznanieShared,
  index: number,
) => {
  const codeTypeMapping = {
    '0': 'a',
    '1': 'b',
    '2': 'c',
    '3': 'd',
    '4': 'e',
    '5': 'f',
    '6': 'g',
    '7': 'h',
    '8': 'i',
  } as const

  return {
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
    PopisStavby: priznanie.popisStavby,
    DatumVznikuDanovejPovinnosti: formatXsDateXml(priznanie.datumVznikuDanovejPovinnosti),
    DatumZanikuDanovejPovinnosti: formatXsDateXml(priznanie.datumZanikuDanovejPovinnosti),
    ZakladDane: formatIntegerXml(priznanie.zakladDane),
    CelkovaVymeraPodlahovychPloch: formatIntegerXml(priznanie.celkovaVymera),
    VymeraPlochOslobodenychOdDane: formatIntegerXml(
      priznanie.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb,
    ),
    VymeraPlochNaJednotliveUcely: {
      VymeraPlochNaJednotlivyUcel: esbsPredmetDaneCiselnik.map((ucel) => ({
        Ucel: ucel,
        Vymera: formatDecimalXml(priznanie.vymeryStaviebPodlaTypu[codeTypeMapping[ucel.Code]]),
      })),
    },
    PocetPodlazi: formatIntegerXml(
      priznanie.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
    ),
    Poznamka: priznanie.poznamka,
  }
}

export const oddiel3ViacereUcelyXml = (data: TaxFormData) => {
  const mapping = oddiel3ViacereUcelyShared(data)

  if (mapping.length === 0) {
    return null
  }

  return {
    DanZoStaviebViacereUcely: {
      DanZoStaviebViacereUcelyZaznam: mapping.map((priznanie, index) =>
        mapPriznanie(data, priznanie, index),
      ),
    },
  }
}
