import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloMimoriadnyOdvozAZhodnotenieOdpaduExample',
  formData: {
    ziadatel: {
      ziadatelTyp: 'Obyvateľ',
      telefon: '+421903111444',
      menoPriezvisko: {
        meno: 'Jozef',
        priezvisko: 'Mrkva',
      },
      adresaObyvatel: {
        ulicaACislo: 'Hlavná ulica 12',
        mestoPsc: {
          mesto: 'Žabokreky',
          psc: '44557',
        },
      },
      emailObyvatel: 'test@email.com',
    },
    sluzba: {
      infoOOdpade: [
        {
          miestoDodania: 'Račianska 5, Bratislava, 83102',
          druhOdpadu: 'Zmesový komunálny odpad',
          objemNadobyZmesovyKomunalnyOdpad: '240 l zberná nádoba',
        },
        {
          miestoDodania: 'Varšavská 101',
          druhOdpadu: 'Biologicky rozložiteľný odpad',
          objemNadobyBiologickyRozlozitelny: '120 l zberná nádoba',
        },
      ],
      preferovanyDatum: '2024-10-09',
      doplnujuceInfo: 'This is an example form for OLO',
    },
    suhlasy: {
      suhlas: true,
    },
  },
}

export default exampleForm
