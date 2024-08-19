import {
  DanZBytovANebytovychPriestorovPriznanie,
  DanZoStaviebJedenUcelPriznania,
  DanZoStaviebViacereUcelyPriznania,
  DanZPozemkovPriznania,
  PravnyVztah,
  Spoluvlastnictvo,
  TaxFormData,
} from '../../types'
import { parseRodneCislo } from './functions'
import { safeBoolean, safeNumber } from '../../../form-utils/safeData'

export const oddielBaseShared = (
  data: TaxFormData,
  priznanie:
    | DanZPozemkovPriznania
    | DanZoStaviebJedenUcelPriznania
    | DanZoStaviebViacereUcelyPriznania
    | DanZBytovANebytovychPriestorovPriznanie,
  isBytyANebytovePriestory = false,
) => ({
  obec: 'Bratislava',
  isVlastnik: priznanie.pravnyVztah === PravnyVztah.Vlastnik,
  isSpravca: priznanie.pravnyVztah === PravnyVztah.Spravca,
  // "Byty a nebytové priestory" doesn't include those two.
  isNajomca: !isBytyANebytovePriestory && priznanie.pravnyVztah === PravnyVztah.Najomca,
  isUzivatel: !isBytyANebytovePriestory && priznanie.pravnyVztah === PravnyVztah.Uzivatel,
  isPodieloveSpoluvlastnictvo: priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove,
  isBezpodieloveSpoluvlastnictvo: priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove,
  spoluvlastnikUrcenyDohodou:
    priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove
      ? safeBoolean(priznanie.naZakladeDohody)
      : undefined,
  pocetSpoluvlastnikov:
    priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove
      ? safeNumber(priznanie.pocetSpoluvlastnikov)
      : undefined,
  rodneCisloManzelaManzelky:
    priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove
      ? parseRodneCislo(data.bezpodieloveSpoluvlastnictvoManzelov?.rodneCislo)
      : undefined,
})
