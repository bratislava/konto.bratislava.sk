/* eslint-disable pii/no-email */
/* eslint-disable pii/no-phone-number */

import {
  DruhPriznaniaEnum,
  PravnyVztahKPO,
  PriznanieAko,
  SplonomocnenecTyp,
  TaxFormData,
} from '../../utils/tax/types'

export default {
  druhPriznania: {
    druh: DruhPriznaniaEnum.Priznanie,
    rok: 2024,
  },
  udajeODanovnikovi: {
    voSvojomMene: false,
    priznanieAko: PriznanieAko.PravnickaOsoba,
    opravnenaOsoba: {
      splnomocnenie: ['6022555f-99ad-47a7-b757-5df2fde62328'],
      splnomocnenecTyp: SplonomocnenecTyp.FyzickaOsoba,
      priezvisko: 'Priezviskooooooooo',
      menoTitul: {
        meno: 'Menooooooooooo',
        titul: 'Mgrtitulpredlhy',
      },
      ulicaCisloFyzickaOsoba: {
        ulica: 'Ulica so strasne dllllhym nazvom',
        cislo: '1233455677891',
      },
      obecPsc: {
        obec: 'Bratislava',
        psc: '83214',
      },
      stat: '703',
      email: 'example.email@gmail.com',
      telefon: '+421940123121',
    },
    pravnyVztahKPO: PravnyVztahKPO.StatutarnyZastupca,
    ico: '823234',
    pravnaForma: '111',
    obchodneMenoAleboNazov: 'Obchodne meno',
    ulicaCisloPravnickaOsoba: {
      ulica: 'Ulica',
      cislo: '11111111111111111',
    },
    obecPsc: {
      obec: 'Bratislava',
      psc: '83212',
    },
    stat: '703',
    email: 'example.email+pravnickaosoba@gmail.com',
    telefon: '+421940123124',
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
        pravnyVztah: 'vlastnik',
        spoluvlastnictvo: 'bezpodieloveSpoluvlastnictvoManzelov',
        pozemky: [
          {
            cisloListuVlastnictva: '1234213',
            kataster: 'Čunovo',
            parcelneCisloSposobVyuzitiaPozemku: {
              cisloParcely: '1237/1',
              sposobVyuzitiaPozemku: 'Sposob vyuzita pozemku',
            },
            druhPozemku: 'B',
            celkovaVymeraPozemku: 100,
            podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '1/2',
            spoluvlastnickyPodiel: '1/2',
            datumy: {
              datumVznikuDanovejPovinnosti: '2023-11-20',
              datumZanikuDanovejPovinnosti: '2023-11-21',
            },
          },
          {
            cisloListuVlastnictva: '2222',
            kataster: 'Devínska Nová Ves',
            parcelneCisloSposobVyuzitiaPozemku: {
              cisloParcely: '1232/3',
              sposobVyuzitiaPozemku: 'Sposob 2',
            },
            druhPozemku: 'C',
            celkovaVymeraPozemku: 100,
            podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '1/2',
            spoluvlastnickyPodiel: '1/1',
            datumy: {
              datumVznikuDanovejPovinnosti: '2023-11-20',
              datumZanikuDanovejPovinnosti: '2023-11-21',
            },
          },
        ],
        poznamka: 'Poznamka hue hue hue.;..',
      },
      {
        pravnyVztah: 'uzivatel',
        spoluvlastnictvo: 'podieloveSpoluvlastnictvo',
        pozemky: [
          {
            cisloListuVlastnictva: '1232',
            kataster: 'Devínska Nová Ves',
            parcelneCisloSposobVyuzitiaPozemku: {
              cisloParcely: '1232/3',
              sposobVyuzitiaPozemku: 'Hehe',
            },
            druhPozemku: 'D',
            celkovaVymeraPozemku: 3,
            podielPriestoruNaSpolocnychCastiachAZariadeniachDomu:
              '123213/1232130',
            spoluvlastnickyPodiel: '1/3',
            datumy: {
              datumVznikuDanovejPovinnosti: '2023-11-20',
              datumZanikuDanovejPovinnosti: '2023-11-21',
            },
            hodnotaUrcenaZnaleckymPosudkom: true,
            znaleckyPosudok: ['d6d59bbe-140f-4bef-b1ad-20bf9cb64511'],
          },
        ],
        poznamka: 'Poznamka k zahradam',
        pocetSpoluvlastnikov: 2,
        naZakladeDohody: true,
        splnomocnenie: ['50c5a384-b479-4513-a374-8b6db01711c3'],
      },
    ],
  },
  danZoStaviebJedenUcel: {
    vyplnitObject: {
      vyplnit: true,
    },
    kalkulackaWrapper: {
      pouzitKalkulacku: true,
    },
    priznania: [
      {
        cisloListuVlastnictva: '46623',
        riadok1: {
          ulicaACisloDomu: 'Ulica 1',
          supisneCislo: '1',
        },
        riadok2: {
          kataster: 'Devínska Nová Ves',
          cisloParcely: '298732/2',
        },
        pravnyVztah: 'vlastnik',
        spoluvlastnictvo: 'somJedinyVlastnik',
        predmetDane: 'a',
        celkovaZastavanaPlocha: 10,
        spoluvlastnickyPodiel: '1/3',
        pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia: 2,
        castStavbyOslobodenaOdDane: true,
        datumy: {
          datumVznikuDanovejPovinnosti: '2023-11-20',
          datumZanikuDanovejPovinnosti: '2023-11-21',
        },
        poznamka: 'Poznamka!',
        castStavbyOslobodenaOdDaneDetaily: {
          celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby: 2,
          vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb: 2,
        },
      },
    ],
  },
  danZoStaviebViacereUcely: {
    vyplnitObject: {
      vyplnit: true,
    },
    kalkulackaWrapper: {
      pouzitKalkulacku: true,
    },
    priznania: [
      {
        cisloListuVlastnictva: '1232',
        riadok1: {
          ulicaACisloDomu: 'Ulica',
          supisneCislo: '12',
        },
        riadok2: {
          kataster: 'Devín',
          cisloParcely: '1232/3',
        },
        pravnyVztah: 'vlastnik',
        spoluvlastnictvo: 'somJedinyVlastnik',
        popisStavby: 'polyfunkcna budova',
        datumy: {
          datumVznikuDanovejPovinnosti: '2023-11-20',
          datumZanikuDanovejPovinnosti: '2023-11-21',
        },
        celkovaVymera: 16,
        pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia: 6,
        castStavbyOslobodenaOdDane: false,
        nehnutelnosti: {
          nehnutelnosti: [
            {
              ucelVyuzitiaStavby: 'a',
              podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '100/10100',
              spoluvlastnickyPodiel: '1/2',
            },
            {
              ucelVyuzitiaStavby: 'a',
              podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '105/10100',
              spoluvlastnickyPodiel: '1/2',
            },
            {
              ucelVyuzitiaStavby: 'b',
              podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '250/20101',
              spoluvlastnickyPodiel: '1/2',
            },
          ],
        },
        poznamka: 'Poznamka',
      },
    ],
  },
  danZBytovANebytovychPriestorov: {
    vyplnitObject: {
      vyplnit: true,
    },
    kalkulackaWrapper: {
      pouzitKalkulacku: true,
    },
    priznania: [
      {
        cisloListuVlastnictva: '1234',
        riadok1: {
          ulicaACisloDomu:
            'Ulicaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          supisneCislo: '12345678901',
        },
        riadok2: {
          kataster: 'Čunovo',
          cisloParcely: '123/3',
        },
        pravnyVztah: 'spravca',
        spoluvlastnictvo: 'somJedinyVlastnik',
        priznanieZaByt: {
          priznanieZaByt: true,
          cisloBytu: '1',
          popisBytu: 'popis bytu',
          podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '123/333',
          spoluvlastnickyPodiel: '1/1',
          vymeraPodlahovejPlochyNaIneUcely: 1,
          datumy: {
            datumVznikuDanovejPovinnosti: '2023-11-20',
            datumZanikuDanovejPovinnosti: '2023-11-21',
          },
        },
        priznanieZaNebytovyPriestor: {
          priznanieZaNebytovyPriestor: true,
          nebytovePriestory: [
            {
              riadok: {
                ucelVyuzitiaNebytovehoPriestoruVBytovomDome: 'garaz',
                cisloNebytovehoPriestoruVBytovomDome: '1',
              },
              podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '1/100',
              spoluvlastnickyPodiel: '1/2',
              datumy: {
                datumVznikuDanovejPovinnosti: '2023-11-20',
                datumZanikuDanovejPovinnosti: '2023-11-21',
              },
            },
          ],
        },
        poznamka: 'Hej!',
      },
    ],
  },
  znizenieAleboOslobodenieOdDane: {
    pozemky: ['option1', 'option2', 'option3', 'option4'],
    stavby: ['option1', 'option2', 'option3'],
    byty: ['option1', 'option2'],
    poznamka: 'Vsekto som vyplnil!',
  },
  bezpodieloveSpoluvlastnictvoManzelov: {
    rodneCislo: '810716/7013',
    priezvisko: 'Priezvisko',
    menoTitul: {
      meno: 'Meno',
    },
    rovnakaAdresa: false,
    email: 'meno.priezvisko@bratislava.sk',
    telefon: '+421902123456',
    ulicaCislo: {
      ulica: 'Testovacia',
      cislo: '12',
    },
    obecPsc: {
      obec: 'Bratislava',
      psc: '81109',
    },
    stat: '703',
  },
} satisfies TaxFormData

/* eslint-enable pii/no-email */
/* eslint-enable pii/no-phone-number */
