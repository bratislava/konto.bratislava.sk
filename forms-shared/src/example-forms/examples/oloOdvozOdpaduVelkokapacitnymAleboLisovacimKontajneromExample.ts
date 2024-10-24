import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloOdvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExample',
  formData: {
    ziadatel: {
      ziadatelTyp: 'Správcovská spoločnosť',
      telefon: '+421888777444',
      fakturacia: {
        iban: 'SK3112000000198742637541',
        elektronickaFaktura: true,
        emailPreFaktury: 'dolny@milan.com',
      },
      nazov: 'Správcovská a.s.',
      adresaPravnickaOsoba: {
        ulicaACislo: 'Horná 12',
        mestoPsc: {
          mesto: 'Bratislava',
          psc: '88844',
        },
      },
      ico: '5451245',
      dic: '54854245',
      platcaDph: true,
      icDph: 'SK445754878',
      kontaktnaOsoba: 'Milan Dolný',
      email: 'dolny@milan.com',
    },
    sluzba: {
      miestoDodania: 'Stredná 10',
      druhOdpadu: 'Iné',
      objemKontajnera: '11m3_8t',
      preferovanyDatumPristavenia: '2024-10-09',
      casPristavenia: '12:55',
      datumOdvozu: '2024-10-18',
      casOdvozu: '07:00',
      druhOdpaduIne: 'Iný odpad',
    },
    suhlasy: {
      suhlas: true,
    },
  },
}

export default exampleForm
