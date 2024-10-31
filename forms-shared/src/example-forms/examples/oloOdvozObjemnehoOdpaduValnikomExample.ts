import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloOdvozObjemnehoOdpaduValnikomExample',
  formData: {
    ziadatel: {
      ziadatelTyp: 'Správcovská spoločnosť',
      nazov: 'Odvoz odpadu a.s.',
      adresaSidla: {
        ulicaACislo: 'Hlavná 10',
        mestoPsc: {
          mesto: 'Nitra',
          psc: '55442',
        },
      },
      ico: '4422110033',
      dic: '15485124545',
      platcaDph: true,
      kontaktnaOsoba: 'Milan Váh',
      telefon: '+421900111444',
      email: 'vah@odvoz.sk',
      fakturacia: {
        iban: 'SK3112000000198742637541',
        elektronickaFaktura: true,
        emailPreFaktury: 'test@faktura.sk',
      },
      icDph: '1653426236',
    },
    sluzba: {
      miestoDodania: 'Vážska 10',
      preferovanyDatumPristavenia: '2024-01-05',
    },
    suhlasy: {
      suhlasSVop: true,
    },
  },
}

export default exampleForm
