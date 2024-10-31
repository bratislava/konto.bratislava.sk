import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloKoloTaxiExample',
  formData: {
    ziadatel: {
      ziadatelTyp: 'Právnická osoba',
      nazovOrganizacie: 'Odpad s.r.o.',
      adresaSidlaOrganizacie: {
        ulicaACislo: 'Palisády 10',
        mestoPsc: {
          mesto: 'Bratislava',
          psc: '82244',
        },
      },
      ico: '154515451',
      dic: '545454524154',
      platcaDph: false,
      konatel: 'Alexander Veľký',
      zastupeny: 'Alexander Macedónsky',
      menoKontaktnejOsoby: 'Jozef Druhý',
      telefon: '+421944555444',
      email: 'test@email.com',
      fakturacia: {
        iban: 'SK3112000000198742637541',
        elektronickaFaktura: true,
        emailPreFaktury: 'velky@alexander.com',
      },
    },
    sluzba: {
      miestoDodania: 'Veľká 10',
      popisDarovanychVeci: 'práčka, kreslo',
      fotoDarovanychVeci: ['3e7b1557-a1ab-459f-907d-3b219255d83a'],
      suhlasSPlatbou: true,
    },
  },
  serverFiles: [
    {
      id: '3e7b1557-a1ab-459f-907d-3b219255d83a',
      fileName: 'test1.jpg',
      fileSize: 0,
      status: 'SAFE',
    },
  ],
}

export default exampleForm
