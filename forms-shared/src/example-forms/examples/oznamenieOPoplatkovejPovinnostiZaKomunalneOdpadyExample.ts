import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oznamenieOPoplatkovejPovinnostiZaKomunalneOdpadyExample',
  formData: {
    typOznamenia: {
      typOznamenia: 'vznik',
    },
    oznamovatel: {
      voSvojomMene: true,
      oznamovatelTyp: 'fyzickaOsoba',
      maElektronickuSchranku: true,
      meno: 'Ján',
      priezvisko: 'Kováč',
      titul: 'Ing.',
      rodneCislo: '910313/1234',
      email: 'jan.kovac@priklad.sk',
      telefon: '+421905987654',
      ulicaACislo: 'Mierová 12',
      mesto: 'Bratislava',
      psc: '82108',
      stat: '703',
      maPrechodnyPobyt: false,
    },
    informacieOOdvoze: {
      datum: '2025-01-01',
      odvozneMiesto: 'Mierová 12',
      typCisla: ['supisneOrientacneCislo'],
      mesto: 'Bratislava',
      psc: '82108',
      katastralneUzemie: '805556',
      stanoviste: 'Mierová 12',
      druhNehnutelnosti: 'rodinnyDom',
      pocetOsob: 4,
      supisneCislo: '1234',
    },
    poplatnici: {
      poplatnici: [
        {
          meno: 'Ján',
          priezvisko: 'Kováč',
          titul: 'Ing.',
          rodneCislo: '910313/1234',
          zhodujeSaAdresa: true,
        },
        {
          meno: 'Marta',
          priezvisko: 'Nováková',
          titul: 'Mgr.',
          rodneCislo: '920414/5678',
          zhodujeSaAdresa: true,
        },
      ],
    },
    komunalnyOdpad: {
      nadoby: [
        {
          objemNadoby: '120LZbernaNadoba',
          pocetNadob: 2,
          frekvenciaOdvozu: '1X7Dni',
        },
      ],
      poznamka: 'Odpad bude odvážaný každý týždeň.',
    },
    biologickyRozlozitelnyOdpadZoZahrad: {
      nadoba: {
        objemNadoby: '240LZbernaNadoba',
      },
      poznamka: 'Záhrada produkuje veľa bioodpadu.',
    },
    biologickyRozlozitelnyOdpadZKuchyne: {
      nadoba: {
        objemNadoby: '20az23LZbernaNadoba',
      },
      poznamka: 'Kuchynský bioodpad bude zbieraný do menších nádob.',
    },
    sposobPlatby: {
      sposobPlatby: 'bezhotovostnyPrevod',
    },
    prilohy: {
      prilohy: ['4f01b72e-f5d6-429e-a4b4-ecb6432f05f7'],
    },
  },
  serverFiles: [
    {
      id: '4f01b72e-f5d6-429e-a4b4-ecb6432f05f7',
      fileName: 'list-vlastnictva.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
  ],
}

export default exampleForm
