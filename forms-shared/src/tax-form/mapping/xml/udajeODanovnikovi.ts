import {
  esbsDruhPriznaniaCiselnik,
  esbsNationalityCiselnik,
  esbsPravnaFormaCiselnik,
  esbsPravnyVztahPOCiselnik,
  esbsTypOsobyCiselnik,
} from '../shared/esbsCiselniky'
import { udajeODanovnikoviShared } from '../shared/udajeODanovnikoviShared'
import { TaxFormData } from '../../types'
import { getCiselnikEntryByCode, getCiselnikEntryByCondition, tituly } from './ciselniky'
import { formatIntegerXml, formatXsDateXml, phoneNumberXml } from './functions'
import { formatRodneCisloXml } from './shared'

export const udajeODanovnikoviXml = (data: TaxFormData) => {
  const mapping = udajeODanovnikoviShared(data)
  const titul = tituly(mapping.titul)
  const splnomocnenecTitul = tituly(mapping.splnomocnenecTitul)

  return {
    DruhPriznania: getCiselnikEntryByCondition(esbsDruhPriznaniaCiselnik, {
      '0': mapping.isPriznanie,
      '1': mapping.isCiastkovePriznanie,
      '2': mapping.isCiastkovePriznanieNaZanikDanovejPovinnosti,
      '3': mapping.isOpravnePriznanie,
      '4': mapping.isDodatocnePriznanie,
    }),
    NaRok: formatIntegerXml(mapping.rok),
    Danovnik: {
      TypOsoby: getCiselnikEntryByCondition(esbsTypOsobyCiselnik, {
        FO: mapping.isFyzickaOsoba,
        PO: mapping.isPravnickaOsoba,
        FOP: mapping.isFyzickaOsobaPodnikatel,
      }),
      IdentifikaciaOsoby: {
        TitulyPredMenom: titul?.predMenom ? { TitulPredMenom: titul.predMenom } : undefined,
        Meno: mapping.meno,
        Priezvisko: mapping.priezvisko,
        // RodnePriezvisko
        // MestskaCast
        TitulyZaMenom: titul?.zaMenom ? { TitulZaMenom: titul.zaMenom } : undefined,
        DatumNarodenia: formatXsDateXml(mapping.datumNarodenia),
        RodneCislo: formatRodneCisloXml(mapping.rodneCislo),
        // CisloObcianskehoPreukazu
        ObchodneMenoNazov: mapping.obchodneMenoAleboNazov,
        // MenoZastupcu
        // PriezviskoZastupcu
        ICO: mapping.ico,
        PravnaForma: getCiselnikEntryByCode(esbsPravnaFormaCiselnik, mapping.pravnaForma),
      },
    },
    AdresaDanovnika: {
      Meno: mapping.meno,
      Priezvisko: mapping.priezvisko,
      ObchodneMenoNazov: mapping.obchodneMenoAleboNazov,
      UlicaACislo: {
        Ulica: mapping.ulica,
        OrientacneCislo: mapping.cislo,
      },
      PSC: mapping.psc,
      Obec: { Name: mapping.obec },
      Stat: getCiselnikEntryByCode(esbsNationalityCiselnik, mapping.stat),
    },
    OpravnenaOsoba: {
      PravnyVztah: getCiselnikEntryByCondition(esbsPravnyVztahPOCiselnik, {
        '0': mapping.splnomocnenecStatutarnyZastupca,
        '1': mapping.splnomocnenecZastupca,
        '2': mapping.splnomocnenecSpravca,
      }),
      Meno: mapping.splnomocnenecMeno,
      Priezvisko: mapping.splnomocnenecPriezvisko,
      TitulyPredMenom: splnomocnenecTitul?.predMenom
        ? { TitulPredMenom: splnomocnenecTitul.predMenom }
        : undefined,
      TitulyZaMenom: splnomocnenecTitul?.zaMenom
        ? { TitulZaMenom: splnomocnenecTitul.zaMenom }
        : undefined,
      ObchodneMenoNazov: mapping.splnomocnenecObchodneMenoAleboNazov,
      AdresaOpravnenejOsoby: {
        UlicaACislo: {
          Ulica: mapping.splnomocnenecUlica,
          // SupisneCislo: // TODO if needed
          OrientacneCislo: mapping.splnomocnenecCislo,
        },
        PSC: mapping.splnomocnenecPsc,
        Obec: { Name: mapping.splnomocnenecObec },
        Stat: getCiselnikEntryByCode(esbsNationalityCiselnik, mapping.splnomocnenecStat),
      },
      KontaktneUdajeOpravnenejOsoby: {
        TelefonneCislo: phoneNumberXml(mapping.splnomocnenecTelefonneCislo),
        Email: mapping.splnomocnenecEmail,
      },
    },
    KontaktneUdajeDanovnika: {
      TelefonneCislo: phoneNumberXml(mapping.telefonneCislo),
      Email: mapping.email,
    },
  }
}
