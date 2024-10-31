import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloOloTaxiExample',
  formData: {
    ziadatel: {
      ziadatelTyp: 'Fyzická osoba',
      menoPriezvisko: {
        meno: 'Jozef',
        priezvisko: 'Olo',
      },
      adresaTrvalehoPobytu: {
        ulicaACislo: 'Mariánska 1',
        mestoPsc: {
          mesto: 'Bratislava',
          psc: '81100',
        },
      },
      telefon: '+421912444555',
      email: 'test@email.com',
    },
    sluzba: {
      miestoDodania: 'Holandská 10',
      preferovanyDatumOdvozu: '2025-05-05',
      preferovanyCasOdvozu: '07:00 (pondelok - sobota)',
      mnozstvoADruhOdpadu: 'Lots of paper.',
      suhlasSPlatbou: true,
    },
    suhlasy: {
      suhlasSVop: true,
    },
  },
}

export default exampleForm
