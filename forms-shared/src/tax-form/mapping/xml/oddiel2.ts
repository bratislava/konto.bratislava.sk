import { esbsDruhPozemkuDaneCiselnik } from '../shared/esbsCiselniky'
import { Oddiel2PriznanieShared, oddiel2Shared } from '../shared/oddiel2Shared'
import { TaxFormData } from '../../types'
import {
  getCiselnikEntryByCode,
  katastralneUzemie,
  pravnyVztah,
  spoluvlastnictvo,
} from './ciselniky'
import { formatDecimalXml, formatIntegerXml, formatXsDateXml } from './functions'
import { formatRodneCisloXml, sharedPriznanieXml } from './shared'

const mapPriznanie = (data: TaxFormData, priznanie: Oddiel2PriznanieShared, index: number) => ({
  PoradoveCislo: index + 1,
  ...sharedPriznanieXml(data),
  Obec: priznanie.obec,
  // For some reason, the XML contains list of all "esbsDruhPozemkuDaneCiselnik" in each entry.
  DruhyZmien: {
    DruhZmeny: esbsDruhPozemkuDaneCiselnik,
  },
  HodnotaPozemkuUrcenaZnalcom: priznanie.hodnotaUrcenaZnaleckymPosudkom,
  PravnyVztah: pravnyVztah(priznanie),
  Spoluvlastnictvo: spoluvlastnictvo(priznanie),
  RodneCisloManzelaAleboManzelky: formatRodneCisloXml(priznanie.rodneCisloManzelaManzelky),
  PocetSpoluvlastnikov: formatIntegerXml(priznanie.pocetSpoluvlastnikov),
  SpoluvlastnikUrcenyDohodou: priznanie.spoluvlastnikUrcenyDohodou,
  Pozemky: {
    Pozemok: priznanie.pozemky.map((pozemok, pozemokIndex) => ({
      PoradoveCislo: pozemokIndex + 1,
      NazovKatastralnehoUzemia: katastralneUzemie(pozemok.katastralneUzemie),
      CisloParcely: pozemok.cisloParcely,
      Vymera: formatDecimalXml(pozemok.vymeraPozemku),
      DruhPozemku: getCiselnikEntryByCode(esbsDruhPozemkuDaneCiselnik, pozemok.druhPozemku),
      DatumVznikuDanovejPovinnosti: formatXsDateXml(pozemok.datumVznikuDanovejPovinnosti),
      DatumZanikuDanovejPovinnosti: formatXsDateXml(pozemok.datumZanikuDanovejPovinnosti),
    })),
  },
})

export const oddiel2Xml = (data: TaxFormData) => {
  const mapping = oddiel2Shared(data)

  if (mapping.length === 0) {
    return null
  }

  return {
    DanZPozemkov: {
      DanZPozemkovZaznam: mapping.map((priznanie, index) => mapPriznanie(data, priznanie, index)),
    },
  }
}
