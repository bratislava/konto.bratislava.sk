import { DruhPriznaniaEnum, PriznanieAko, TaxFormData } from '../../tax-form/types'
import { ExampleForm } from '../types'

const exampleForm: ExampleForm<TaxFormData> = {
  name: 'priznanieKDaniZNehnutelnostiExample2',
  formData: {
    druhPriznania: {
      rok: 2024,
      druh: DruhPriznaniaEnum.CiastkovePriznanie,
    },
    udajeODanovnikovi: {
      stat: '703',
      email: 'test@test.ts',
      obecPsc: {
        psc: '84106',
        obec: 'Bratislava',
      },
      telefon: '+42191111111',
      priznanieAko: PriznanieAko.FyzickaOsoba,
      voSvojomMene: true,
      menoTitul: {
        meno: 'Test',
      },
      priezvisko: 'Test',
      rodneCislo: '1.1.1993',
      ulicaCisloFyzickaOsoba: {
        cislo: '15A',
        ulica: 'Ulica ',
      },
      korespondencnaAdresa: {
        korespondencnaAdresaRovnaka: true,
      },
    },
    danZPozemkov: {
      vyplnitObject: {
        vyplnit: true,
      },
      kalkulackaWrapper: {
        pouzitKalkulacku: true,
      },
      priznania: [
        {
          pozemky: [
            {
              kataster: 'Záhorská Bystrica',
              druhPozemku: 'F',
              celkovaVymeraPozemku: 2,
              cisloListuVlastnictva: '1111',
              spoluvlastnickyPodiel: '1/1',
              parcelneCisloSposobVyuzitiaPozemku: {
                cisloParcely: '730/2',
              },
              podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '1/1',
            },
          ],
          pravnyVztah: 'vlastnik',
          spoluvlastnictvo: 'bezpodieloveSpoluvlastnictvoManzelov',
        },
        {
          pozemky: [
            {
              kataster: 'Záhorská Bystrica',
              druhPozemku: 'C',
              celkovaVymeraPozemku: 24,
              cisloListuVlastnictva: '1111',
              spoluvlastnickyPodiel: '1/1',
              parcelneCisloSposobVyuzitiaPozemku: {
                cisloParcely: '755/4',
              },
              podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '1/1',
            },
          ],
          pravnyVztah: 'vlastnik',
          spoluvlastnictvo: 'bezpodieloveSpoluvlastnictvoManzelov',
        },
      ],
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
    bezpodieloveSpoluvlastnictvoManzelov: {
      email: 'test@test.ts',
      telefon: '+42191111111',
      menoTitul: {
        meno: 'Test',
        titul: 'Ing',
      },
      priezvisko: 'Test',
      rodneCislo: '123232/1234',
      rovnakaAdresa: true,
    },
    znizenieAleboOslobodenieOdDane: {
      byty: [],
      stavby: [],
      pozemky: [],
    },
  },
}

export default exampleForm
