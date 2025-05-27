import {
  DruhPriznaniaEnum,
  PravnyVztahKPO,
  PriznanieAko,
  SplonomocnenecTyp,
  TaxFormData,
} from '../../types'
import { parseBirthDate, parseRodneCislo } from './functions'
import { safeBoolean, safeNumber, safeString } from '../../../form-utils/safeData'

export const udajeODanovnikoviShared = (data: TaxFormData) => {
  const { udajeODanovnikovi: oddiel, druhPriznania } = data
  const priznanieAkoFyzickaOsoba = oddiel?.priznanieAko === PriznanieAko.FyzickaOsoba
  const priznanieAkoFyzickaOsobaPodnikatel =
    oddiel?.priznanieAko === PriznanieAko.FyzickaOsobaPodnikatel
  const priznanieAkoPravnickaOsoba = oddiel?.priznanieAko === PriznanieAko.PravnickaOsoba
  const podanie =
    priznanieAkoFyzickaOsoba || priznanieAkoFyzickaOsobaPodnikatel || priznanieAkoPravnickaOsoba

  const priznanieFields = podanie
    ? {
        psc: safeString(oddiel?.obecPsc?.psc),
        obec: safeString(oddiel?.obecPsc?.obec),
        stat: safeString(oddiel?.stat),
        telefonneCislo: safeString(oddiel?.telefon),
        email: safeString(oddiel?.email),
      }
    : {}

  const fyzickaOsobaFields = priznanieAkoFyzickaOsoba
    ? {
        priezvisko: safeString(oddiel?.priezvisko),
        meno: safeString(oddiel?.menoTitul?.meno),
        titul: safeString(oddiel?.menoTitul?.titul),
        ulica: safeString(oddiel?.ulicaCisloFyzickaOsoba?.ulica),
        cislo: safeString(oddiel?.ulicaCisloFyzickaOsoba?.cislo),
        rodneCislo: parseRodneCislo(oddiel?.rodneCislo),
        datumNarodenia: parseBirthDate(oddiel?.rodneCislo),
      }
    : {}

  const fyzickaOsobaPodnikatelFields = priznanieAkoFyzickaOsobaPodnikatel
    ? {
        ico: safeString(oddiel?.ico),
        obchodneMenoAleboNazov: safeString(oddiel?.obchodneMenoAleboNazov),
        ulica: safeString(oddiel?.ulicaCisloFyzickaOsobaPodnikatel?.ulica),
        cislo: safeString(oddiel?.ulicaCisloFyzickaOsobaPodnikatel?.cislo),
      }
    : {}

  const pravnickaOsobaFields = priznanieAkoPravnickaOsoba
    ? {
        ico: safeString(oddiel?.ico),
        pravnaForma: safeString(oddiel?.pravnaForma),
        obchodneMenoAleboNazov: safeString(oddiel?.obchodneMenoAleboNazov),
        ulica: safeString(oddiel?.ulicaCisloPravnickaOsoba?.ulica),
        cislo: safeString(oddiel?.ulicaCisloPravnickaOsoba?.cislo),
      }
    : {}

  const voSvojomMene = safeBoolean(oddiel?.voSvojomMene) === true
  const splnomocnenecFyzickaOsoba =
    !voSvojomMene && oddiel?.opravnenaOsoba?.splnomocnenecTyp === SplonomocnenecTyp.FyzickaOsoba
  const splnomocnenecPravnickaOsoba =
    !voSvojomMene && oddiel?.opravnenaOsoba?.splnomocnenecTyp === SplonomocnenecTyp.PravnickaOsoba
  const splnomocnenec = splnomocnenecFyzickaOsoba || splnomocnenecPravnickaOsoba
  const udajeOOpravnenejOsobeNaPodaniePriznania = voSvojomMene && priznanieAkoPravnickaOsoba
  const pravnickaOsobaNieVoSvojomMene = !voSvojomMene && priznanieAkoPravnickaOsoba

  const splnomocnenecFields = splnomocnenec
    ? {
        splnomocnenecPsc: safeString(oddiel?.opravnenaOsoba?.obecPsc?.psc),
        splnomocnenecObec: safeString(oddiel?.opravnenaOsoba?.obecPsc?.obec),
        splnomocnenecStat: safeString(oddiel?.opravnenaOsoba?.stat),
        splnomocnenecTelefonneCislo: safeString(oddiel?.opravnenaOsoba?.telefon),
        splnomocnenecEmail: safeString(oddiel?.opravnenaOsoba?.email),
      }
    : {}
  const splnomocnenecFyzickaOsobaFields = splnomocnenecFyzickaOsoba
    ? {
        splnomocnenecPriezvisko: safeString(oddiel?.opravnenaOsoba?.priezvisko),
        splnomocnenecMeno: safeString(oddiel?.opravnenaOsoba?.menoTitul?.meno),
        splnomocnenecTitul: safeString(oddiel?.opravnenaOsoba?.menoTitul?.titul),
        splnomocnenecUlica: safeString(oddiel?.opravnenaOsoba?.ulicaCisloFyzickaOsoba?.ulica),
        splnomocnenecCislo: safeString(oddiel?.opravnenaOsoba?.ulicaCisloFyzickaOsoba?.cislo),
      }
    : {}

  const splnomocnenecPravnickaOsobaFields = splnomocnenecFyzickaOsoba
    ? {
        splnomocnenecObchodneMenoAleboNazov: safeString(
          oddiel?.opravnenaOsoba?.obchodneMenoAleboNazov,
        ),
        splnomocnenecUlica: safeString(oddiel?.opravnenaOsoba?.ulicaCisloPravnickaOsoba?.ulica),
        splnomocnenecCislo: safeString(oddiel?.opravnenaOsoba?.ulicaCisloPravnickaOsoba?.cislo),
      }
    : {}

  const pravnickaOsobaNieVoSvojomMeneFields = pravnickaOsobaNieVoSvojomMene
    ? {
        splnomocnenecStatutarnyZastupca:
          oddiel?.pravnyVztahKPO === PravnyVztahKPO.StatutarnyZastupca,
        splnomocnenecZastupca: oddiel?.pravnyVztahKPO === PravnyVztahKPO.Zastupca,
        splnomocnenecSpravca: oddiel?.pravnyVztahKPO === PravnyVztahKPO.Spravca,
      }
    : {}

  const udajeOOpravnenejOsobeNaPodaniePriznaniaFields = udajeOOpravnenejOsobeNaPodaniePriznania
    ? {
        splnomocnenecPriezvisko: safeString(
          oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.priezvisko,
        ),
        splnomocnenecMeno: safeString(
          oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.menoTitul?.meno,
        ),
        splnomocnenecTitul: safeString(
          oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.menoTitul?.titul,
        ),
        splnomocnenecUlica: safeString(
          oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.ulicaCisloFyzickaOsoba?.ulica,
        ),
        splnomocnenecCislo: safeString(
          oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.ulicaCisloFyzickaOsoba?.cislo,
        ),
        splnomocnenecPsc: safeString(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.obecPsc?.psc),
        splnomocnenecObec: safeString(
          oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.obecPsc?.obec,
        ),
        splnomocnenecStat: safeString(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.stat),
        splnomocnenecTelefonneCislo: safeString(
          oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.telefon,
        ),
        splnomocnenecEmail: safeString(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.email),
        splnomocnenecStatutarnyZastupca:
          oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.pravnyVztahKPO ===
          PravnyVztahKPO.StatutarnyZastupca,
        splnomocnenecZastupca:
          oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.pravnyVztahKPO ===
          PravnyVztahKPO.Zastupca,
        splnomocnenecSpravca:
          oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.pravnyVztahKPO ===
          PravnyVztahKPO.Spravca,
      }
    : {}

  return {
    isPriznanie: druhPriznania?.druh === DruhPriznaniaEnum.Priznanie,
    isCiastkovePriznanie: druhPriznania?.druh === DruhPriznaniaEnum.CiastkovePriznanie,
    isCiastkovePriznanieNaZanikDanovejPovinnosti:
      druhPriznania?.druh === DruhPriznaniaEnum.CiastkovePriznanieNaZanikDanovejPovinnosti,
    isOpravnePriznanie: druhPriznania?.druh === DruhPriznaniaEnum.OpravnePriznanie,
    isDodatocnePriznanie: druhPriznania?.druh === DruhPriznaniaEnum.DodatocnePriznanie,
    rok: safeNumber(druhPriznania?.rok),
    isFyzickaOsoba: priznanieAkoFyzickaOsoba,
    isFyzickaOsobaPodnikatel: priznanieAkoFyzickaOsobaPodnikatel,
    isPravnickaOsoba: priznanieAkoPravnickaOsoba,
    ...priznanieFields,
    ...fyzickaOsobaFields,
    ...fyzickaOsobaPodnikatelFields,
    ...pravnickaOsobaFields,
    ...splnomocnenecFyzickaOsobaFields,
    ...splnomocnenecPravnickaOsobaFields,
    ...splnomocnenecFields,
    ...pravnickaOsobaNieVoSvojomMeneFields,
    ...udajeOOpravnenejOsobeNaPodaniePriznaniaFields,
  }
}
