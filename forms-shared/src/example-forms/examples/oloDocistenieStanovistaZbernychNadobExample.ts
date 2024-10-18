import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloDocistenieStanovistaZbernychNadobExample',
  formData: {
    ziadatel: {
      ziadatelTyp: 'Fyzická osoba',
      telefon: '+421948777555',
      fakturacia: {
        iban: 'SK3112000000198742637541',
        elektronickaFaktura: true,
        emailPreFaktury: 'faktura@email.com',
      },
      menoPriezvisko: {
        meno: 'Jozef',
        priezvisko: 'Veľký',
      },
      adresaObyvatel: {
        ulicaACislo: 'Veľká 90',
        mestoPsc: {
          mesto: 'Šamorín',
          psc: '44422',
        },
      },
    },
    sluzba: {
      miestoDodania: 'Modrá 102',
      komodita: 'Kuchynský biologicky rozložiteľný odpad',
      preferovanyDatum: '2024-10-01',
      doplnujuceInfo: 'I am testing OLO submissions',
    },
    suhlasy: {
      suhlas: true,
    },
  },
}

export default exampleForm
