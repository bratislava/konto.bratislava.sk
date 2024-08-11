import { DruhPriznaniaEnum, PriznanieAko, TaxFormData } from '../../tax-form/types'
import { ExampleForm } from '../types'

const exampleForm: ExampleForm<TaxFormData> = {
  name: 'priznanieKDaniZNehnutelnostiExample1',
  formData: {
    danZPozemkov: {
      priznania: [
        {
          pozemky: [
            {
              kataster: 'Nové Mesto',
              druhPozemku: 'E',
              celkovaVymeraPozemku: 215,
              cisloListuVlastnictva: '0000',
              spoluvlastnickyPodiel: '1/1',
              parcelneCisloSposobVyuzitiaPozemku: {
                cisloParcely: '2567/0',
              },
              podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '2569/15897',
            },
          ],
          pravnyVztah: 'vlastnik',
          spoluvlastnictvo: 'somJedinyVlastnik',
        },
      ],
      vyplnitObject: {
        vyplnit: true,
      },
      kalkulackaWrapper: {
        pouzitKalkulacku: true,
      },
    },
    druhPriznania: {
      rok: 2024,
      druh: DruhPriznaniaEnum.Priznanie,
    },
    udajeODanovnikovi: {
      stat: '703',
      email: 'meno@gmail.com',
      obecPsc: {
        psc: '83103',
        obec: 'Bratislava',
      },
      telefon: '+421948111111',
      menoTitul: {
        meno: 'Peter',
      },
      priezvisko: 'AAA Skúšobné s r .o',
      rodneCislo: '920314/6326',
      priznanieAko: PriznanieAko.FyzickaOsoba,
      voSvojomMene: true,
      korespondencnaAdresa: {
        korespondencnaAdresaRovnaka: true,
      },
      ulicaCisloFyzickaOsoba: {
        cislo: '6',
        ulica: 'Robotnícka',
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
      pozemky: ['option2', 'option4'],
    },
  },
}

export default exampleForm
