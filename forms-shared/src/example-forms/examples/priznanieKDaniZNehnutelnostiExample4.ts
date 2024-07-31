import { DruhPriznaniaEnum, PriznanieAko, TaxFormData } from '../../tax-form/types'
import { ExampleForm } from '../types'

const exampleForm: ExampleForm<TaxFormData> = {
  name: 'priznanieKDaniZNehnutelnostiExample4',
  formData: {
    druhPriznania: {
      rok: 2024,
      druh: DruhPriznaniaEnum.CiastkovePriznanieNaZanikDanovejPovinnosti,
    },
    danZPozemkov: {
      vyplnitObject: {
        vyplnit: false,
      },
    },
    udajeODanovnikovi: {
      stat: '703',
      email: 'test@test.sk',
      obecPsc: {
        psc: '91701',
        obec: 'Trnava',
      },
      telefon: '+421911111111',
      menoTitul: {
        meno: 'Test',
      },
      priezvisko: 'Test ',
      rodneCislo: '93823741111',
      priznanieAko: PriznanieAko.FyzickaOsoba,
      voSvojomMene: true,
      korespondencnaAdresa: {
        korespondencnaAdresaRovnaka: true,
      },
      ulicaCisloFyzickaOsoba: {
        cislo: '1111/61',
        ulica: 'Test',
      },
    },
    danZoStaviebJedenUcel: {
      vyplnitObject: {
        vyplnit: false,
      },
    },
    danZoStaviebViacereUcely: {
      vyplnitObject: {
        vyplnit: false,
      },
    },
    danZBytovANebytovychPriestorov: {
      vyplnitObject: {
        vyplnit: false,
      },
    },
    znizenieAleboOslobodenieOdDane: {
      byty: [],
      stavby: [],
      pozemky: [],
    },
  },
}

export default exampleForm
