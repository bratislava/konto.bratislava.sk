import { DruhPriznaniaEnum, PriznanieAko, TaxFormData } from '../../tax-form/types'
import { ExampleForm } from '../types'

const exampleForm: ExampleForm<TaxFormData> = {
  name: 'priznanieKDaniZNehnutelnostiExample5',
  formData: {
    druhPriznania: { rok: 2024, druh: DruhPriznaniaEnum.OpravnePriznanie },
    udajeODanovnikovi: {
      stat: '686',
      email: 'test@test.com',
      obecPsc: { psc: '83103', obec: 'Bratislava' },
      telefon: '+421948417711',
      priznanieAko: PriznanieAko.FyzickaOsoba,
      voSvojomMene: true,
      menoTitul: { meno: 'Lincoln', titul: 'Mgr.' },
      priezvisko: 'Abraham',
      rodneCislo: '9203146326',
      ulicaCisloFyzickaOsoba: { cislo: '6', ulica: 'Robotnícka' },
      korespondencnaAdresa: {
        korespondencnaAdresaRovnaka: false,
        stat: '703',
        obecPsc: { psc: '83106', obec: 'Bratislava' },
        ulicaCisloKorespondencnaAdresa: { cislo: '7', ulica: 'Prašivá' },
      },
    },
    danZPozemkov: {
      vyplnitObject: { vyplnit: true },
      kalkulackaWrapper: { pouzitKalkulacku: true },
      priznania: [
        {
          pozemky: [
            {
              datumy: {
                datumVznikuDanovejPovinnosti: '2024-01-13',
                datumZanikuDanovejPovinnosti: '2024-01-04',
              },
              kataster: 'Devínska Nová Ves',
              druhPozemku: 'B',
              celkovaVymeraPozemku: 218,
              cisloListuVlastnictva: '4589',
              spoluvlastnickyPodiel: '1/1',
              parcelneCisloSposobVyuzitiaPozemku: {
                cisloParcely: '7986/1',
                sposobVyuzitiaPozemku: 'Ložisko',
              },
              podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '4587/53994',
            },
            {
              datumy: {
                datumVznikuDanovejPovinnosti: '2024-01-13',
                datumZanikuDanovejPovinnosti: '2024-01-04',
              },
              kataster: 'Devínska Nová Ves',
              druhPozemku: 'B',
              celkovaVymeraPozemku: 218,
              cisloListuVlastnictva: '4589',
              spoluvlastnickyPodiel: '1/1',
              parcelneCisloSposobVyuzitiaPozemku: {
                cisloParcely: '7986/1',
                sposobVyuzitiaPozemku: 'Ložisko',
              },
              podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '4587/53994',
            },
          ],
          pravnyVztah: 'vlastnik',
          spoluvlastnictvo: 'somJedinyVlastnik',
        },
      ],
    },
    danZoStaviebJedenUcel: {
      vyplnitObject: { vyplnit: true },
      kalkulackaWrapper: { pouzitKalkulacku: true },
      priznania: [
        {
          datumy: {
            datumVznikuDanovejPovinnosti: '2024-01-04',
            datumZanikuDanovejPovinnosti: '2024-01-06',
          },
          riadok1: { supisneCislo: 2526, ulicaACisloDomu: 'Príkladná 35' },
          riadok2: { kataster: 'Jarovce', cisloParcely: '7859/1' },
          pravnyVztah: 'vlastnik',
          predmetDane: 'a',
          spoluvlastnictvo: 'podieloveSpoluvlastnictvo',
          cisloListuVlastnictva: '4597',
          spoluvlastnickyPodiel: '1/2',
          celkovaZastavanaPlocha: 2659,
          castStavbyOslobodenaOdDane: true,
          pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia: 5,
          naZakladeDohody: true,
          pocetSpoluvlastnikov: 2,
          splnomocnenie: [],
          castStavbyOslobodenaOdDaneDetaily: {
            celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby: 26,
            vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb: 89,
          },
        },
      ],
    },
    danZoStaviebViacereUcely: {
      vyplnitObject: { vyplnit: true },
      kalkulackaWrapper: { pouzitKalkulacku: true },
      priznania: [
        {
          datumy: {
            datumVznikuDanovejPovinnosti: '2024-01-05',
            datumZanikuDanovejPovinnosti: '2024-01-04',
          },
          riadok1: { supisneCislo: 35, ulicaACisloDomu: 'Príkladná 35' },
          riadok2: { kataster: 'Devín', cisloParcely: '5697/1' },
          poznamka: 'Príkladná 35',
          popisStavby: 'Príkladná stavba',
          pravnyVztah: 'najomca',
          celkovaVymera: 25648,
          nehnutelnosti: {
            nehnutelnosti: [
              {
                ucelVyuzitiaStavby: 'b',
                spoluvlastnickyPodiel: '1/1',
                podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '4598/26594',
              },
            ],
          },
          spoluvlastnictvo: 'bezpodieloveSpoluvlastnictvoManzelov',
          cisloListuVlastnictva: '4597',
          castStavbyOslobodenaOdDane: true,
          pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia: 4,
          vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb: 26,
        },
      ],
    },
    danZBytovANebytovychPriestorov: {
      vyplnitObject: { vyplnit: true },
      kalkulackaWrapper: { pouzitKalkulacku: true },
      priznania: [
        {
          riadok1: { supisneCislo: 3694, ulicaACisloDomu: 'Príkladná 35' },
          riadok2: { kataster: 'Karlova Ves', cisloParcely: '6975/2' },
          poznamka: 'Príkladná 35',
          pravnyVztah: 'spravca',
          priznanieZaByt: {
            priznanieZaByt: true,
            datumy: {
              datumVznikuDanovejPovinnosti: '2024-01-16',
              datumZanikuDanovejPovinnosti: '2024-01-07',
            },
            cisloBytu: '3',
            popisBytu: 'Dvojizbak',
            spoluvlastnickyPodiel: '1/1',
            vymeraPodlahovejPlochyNaIneUcely: 18,
            podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '2654/36594',
          },
          spoluvlastnictvo: 'podieloveSpoluvlastnictvo',
          cisloListuVlastnictva: '2648',
          priznanieZaNebytovyPriestor: {
            priznanieZaNebytovyPriestor: true,
            nebytovePriestory: [
              {
                datumy: {
                  datumVznikuDanovejPovinnosti: '2024-01-05',
                  datumZanikuDanovejPovinnosti: '2024-01-12',
                },
                riadok: {
                  cisloNebytovehoPriestoruVBytovomDome: 'G05',
                  ucelVyuzitiaNebytovehoPriestoruVBytovomDome: 'Garáž',
                },
                spoluvlastnickyPodiel: '1/5',
                podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '2659/86569',
              },
            ],
          },
          naZakladeDohody: false,
          pocetSpoluvlastnikov: 3,
        },
      ],
    },
    bezpodieloveSpoluvlastnictvoManzelov: {
      email: 'test@test.com',
      telefon: '+421948417711',
      menoTitul: { meno: 'Petra', titul: 'Bsc' },
      priezvisko: 'Príkladná',
      rodneCislo: '920314/2634',
      rovnakaAdresa: false,
      stat: '703',
      obecPsc: { psc: '83106', obec: 'Abelova' },
      ulicaCisloBezpodieloveSpoluvlastnictvoManzelov: {
        cislo: '25',
        ulica: 'Príkladná 35',
      },
    },
    znizenieAleboOslobodenieOdDane: {
      byty: ['option1', 'option2'],
      stavby: ['option1', 'option2', 'option3'],
      pozemky: ['option1', 'option2', 'option3', 'option4'],
      poznamka: 'Príkladná 35',
    },
  },
}

export default exampleForm
