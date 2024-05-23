/* eslint-disable import/prefer-default-export,@typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair,sonarjs/cognitive-complexity */
import { parseRodneCislo } from '../shared-mapping/functions'
import { getTitleFromStatCiselnik } from '../tax-pdf-mapping-v2/statCiselnik'
import {
  DruhPriznaniaEnum,
  PravnyVztahKPO,
  PriznanieAko,
  SplonomocnenecTyp,
  TaxFormData,
} from '../types'
import { safeBoolean, safeNumber, safeString } from './functions'

function getRok(rok: number | undefined) {
  const stringified = safeNumber(rok)?.toString()
  // Is number between 2000 and 2099
  if (stringified && /^(20\d{2})$/g.test(stringified)) {
    return stringified?.slice(-2)
  }
  // eslint-disable-next-line unicorn/no-useless-undefined
  return undefined
}

export const udajeODanovnikovi = (data: TaxFormData) => {
  const { udajeODanovnikovi: oddiel, druhPriznania } = data
  const priznanieAkoFyzickaOsoba =
    oddiel?.priznanieAko === PriznanieAko.FyzickaOsoba
  const priznanieAkoFyzickaOsobaPodnikatel =
    oddiel?.priznanieAko === PriznanieAko.FyzickaOsobaPodnikatel
  const priznanieAkoPravnickaOsoba =
    oddiel?.priznanieAko === PriznanieAko.PravnickaOsoba
  const podanie =
    priznanieAkoFyzickaOsoba ||
    priznanieAkoFyzickaOsobaPodnikatel ||
    priznanieAkoPravnickaOsoba

  const rodneCislo = priznanieAkoFyzickaOsoba
    ? parseRodneCislo(oddiel?.rodneCislo)
    : null

  const priznanieFields = podanie
    ? {
        PSC: safeString(oddiel?.obecPsc?.psc),
        Obec: safeString(oddiel?.obecPsc?.obec),
        Stat: getTitleFromStatCiselnik(oddiel?.stat),
        TelefonneCislo: safeString(oddiel?.telefon),
        Email: safeString(oddiel?.email),
      }
    : {}

  const fyzickaOsobaFields = priznanieAkoFyzickaOsoba
    ? {
        Priezvisko: safeString(oddiel?.priezvisko),
        Meno: safeString(oddiel?.menoTitul?.meno),
        Titul: safeString(oddiel?.menoTitul?.titul),
        Ulica: safeString(oddiel?.ulicaCisloFyzickaOsoba?.ulica),
        Cislo: safeString(oddiel?.ulicaCisloFyzickaOsoba?.cislo),
        RodneCislo1: rodneCislo?.isValid ? rodneCislo.firstPart : undefined,
        RodneCislo2: rodneCislo?.isValid ? rodneCislo.secondPart : undefined,
      }
    : {}

  const fyzickaOsobaPodnikatelFields = priznanieAkoFyzickaOsobaPodnikatel
    ? {
        Ico: safeString(oddiel?.ico),
        ObchodnyNazov: safeString(oddiel?.obchodneMenoAleboNazov),
        Ulica: safeString(oddiel?.ulicaCisloFyzickaOsobaPodnikatel?.ulica),
        Cislo: safeString(oddiel?.ulicaCisloFyzickaOsobaPodnikatel?.cislo),
      }
    : {}

  const pravnickaOsobaFields = priznanieAkoPravnickaOsoba
    ? {
        Ico: safeString(oddiel?.ico),
        PravnaForma: safeString(oddiel?.pravnaForma),
        ObchodnyNazov: safeString(oddiel?.obchodneMenoAleboNazov),
        Ulica: safeString(oddiel?.ulicaCisloPravnickaOsoba?.ulica),
        Cislo: safeString(oddiel?.ulicaCisloPravnickaOsoba?.cislo),
      }
    : {}

  const voSvojomMene = safeBoolean(oddiel?.voSvojomMene) === true
  const splnomocnenecFyzickaOsoba =
    !voSvojomMene &&
    oddiel?.opravnenaOsoba?.splnomocnenecTyp === SplonomocnenecTyp.FyzickaOsoba
  const splnomocnenecPravnickaOsoba =
    !voSvojomMene &&
    oddiel?.opravnenaOsoba?.splnomocnenecTyp ===
      SplonomocnenecTyp.PravnickaOsoba
  const splnomocnenec = splnomocnenecFyzickaOsoba || splnomocnenecPravnickaOsoba
  const udajeOOpravnenejOsobeNaPodaniePriznania =
    voSvojomMene && priznanieAkoPravnickaOsoba
  const pravnickaOsobaNieVoSvojomMene =
    !voSvojomMene && priznanieAkoPravnickaOsoba

  const splnomocnenecFields = splnomocnenec
    ? {
        PSC1: safeString(oddiel?.opravnenaOsoba?.obecPsc?.psc),
        Obec1: safeString(oddiel?.opravnenaOsoba?.obecPsc?.obec),
        Stat1: getTitleFromStatCiselnik(oddiel?.opravnenaOsoba?.stat),
        TelefonneCislo1: safeString(oddiel?.opravnenaOsoba?.telefon),
        Email1: safeString(oddiel?.opravnenaOsoba?.email),
      }
    : {}
  const splnomocnenecFyzickaOsobaFields = splnomocnenecFyzickaOsoba
    ? {
        Priezvisko1: safeString(oddiel?.opravnenaOsoba?.priezvisko),
        Meno1: safeString(oddiel?.opravnenaOsoba?.menoTitul?.meno),
        Titul1: safeString(oddiel?.opravnenaOsoba?.menoTitul?.titul),
        Ulica1: safeString(
          oddiel?.opravnenaOsoba?.ulicaCisloFyzickaOsoba?.ulica,
        ),
        Cislo1: safeString(
          oddiel?.opravnenaOsoba?.ulicaCisloFyzickaOsoba?.cislo,
        ),
      }
    : {}

  const splnomocnenecPravnickaOsobaFields = splnomocnenecFyzickaOsoba
    ? {
        ObchodnyNazov1: safeString(
          oddiel?.opravnenaOsoba?.obchodneMenoAleboNazov,
        ),
        Ulica1: safeString(
          oddiel?.opravnenaOsoba?.ulicaCisloPravnickaOsoba?.ulica,
        ),
        Cislo1: safeString(
          oddiel?.opravnenaOsoba?.ulicaCisloPravnickaOsoba?.cislo,
        ),
      }
    : {}

  const pravnickaOsobaNieVoSvojomMeneFields = pravnickaOsobaNieVoSvojomMene
    ? {
        chbVztah1: oddiel?.pravnyVztahKPO === PravnyVztahKPO.StatutarnyZastupca,
        chbVztah2: oddiel?.pravnyVztahKPO === PravnyVztahKPO.Zastupca,
        chbVztah3: oddiel?.pravnyVztahKPO === PravnyVztahKPO.Spravca,
      }
    : {}

  const udajeOOpravnenejOsobeNaPodaniePriznaniaFields =
    udajeOOpravnenejOsobeNaPodaniePriznania
      ? {
          Priezvisko1: safeString(
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.priezvisko,
          ),
          Meno1: safeString(
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.menoTitul?.meno,
          ),
          Titul1: safeString(
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.menoTitul?.titul,
          ),
          Ulica1: safeString(
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania
              ?.ulicaCisloFyzickaOsoba?.ulica,
          ),
          Cislo1: safeString(
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania
              ?.ulicaCisloFyzickaOsoba?.cislo,
          ),
          PSC1: safeString(
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.obecPsc?.psc,
          ),
          Obec1: safeString(
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.obecPsc?.obec,
          ),
          Stat1: getTitleFromStatCiselnik(
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.stat,
          ),
          TelefonneCislo1: safeString(
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.telefon,
          ),
          Email1: safeString(
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.email,
          ),
          chbVztah1:
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.pravnyVztahKPO ===
            PravnyVztahKPO.StatutarnyZastupca,
          chbVztah2:
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.pravnyVztahKPO ===
            PravnyVztahKPO.Zastupca,
          chbVztah3:
            oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.pravnyVztahKPO ===
            PravnyVztahKPO.Spravca,
        }
      : {}

  return {
    chbPriznanie1: druhPriznania?.druh === DruhPriznaniaEnum.Priznanie,
    chbPriznanie2: druhPriznania?.druh === DruhPriznaniaEnum.CiastkovePriznanie,
    chbPriznanie3:
      druhPriznania?.druh ===
      DruhPriznaniaEnum.CiastkovePriznanieNaZanikDanovejPovinnosti,
    chbPriznanie4: druhPriznania?.druh === DruhPriznaniaEnum.OpravnePriznanie,
    chbPriznanie5: druhPriznania?.druh === DruhPriznaniaEnum.DodatocnePriznanie,
    Rok2: getRok(druhPriznania?.rok),
    chbFO: priznanieAkoFyzickaOsoba,
    chbPO: priznanieAkoPravnickaOsoba || priznanieAkoFyzickaOsobaPodnikatel,
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
