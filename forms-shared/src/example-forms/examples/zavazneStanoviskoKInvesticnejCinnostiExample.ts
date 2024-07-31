import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'zavazneStanoviskoKInvesticnejCinnostiExample',
  formData: {
    ziadatel: {
      typ: 'Fyzická osoba',
      email: 'jan.kovac@priklad.sk',
      telefon: '+421905987654',
      menoPriezvisko: 'Ján Kováč',
      adresa: {
        ulicaACislo: 'Mierová 12',
        mestoPsc: {
          mesto: 'Bratislava',
          psc: '82108',
        },
      },
    },
    investor: {
      investorZiadatelom: false,
      splnomocnenie: 'b9050ef5-0d98-41c4-aba1-b0fc5a65a442',
      typ: 'Fyzická osoba',
      email: 'marta.novakova@priklad.sk',
      telefon: '+421902123456',
      menoPriezvisko: 'Marta Nováková',
      adresa: {
        ulicaACislo: 'Šancová 56',
        mestoPsc: {
          mesto: 'Bratislava',
          psc: '83104',
        },
      },
    },
    zodpovednyProjektant: {
      menoPriezvisko: 'Peter Horváth',
      email: 'peter.horvath@priklad.sk',
      projektantTelefon: '+421911654321',
      autorizacneOsvedcenie: '123456789',
      datumSpracovania: '2024-07-04',
    },
    stavba: {
      nazov: 'Nový Bytový Dom',
      druhStavby: 'Bytový dom',
      ulica: 'Dunajská',
      supisneCislo: '1234',
      parcelneCislo: '56789',
      kataster: ['Karlova Ves', 'Dúbravka'],
    },
    konanieTyp: {
      typ: 'Konanie o dodatočnom povolení stavby',
      ziadostOdovodnenie: 'Dodatočné povolenie zmeny stavby pred dokončením',
      stavbaPisomnosti: ['4110b6da-0dd7-4007-8c13-896134f1eaa0'],
      stavbaFotodokumentacia: ['8bfd16c6-49d5-45d2-987e-cba0ff0ebdd9'],
    },
    prilohy: {
      projektovaDokumentacia: [
        '1cdcb500-7f11-45d1-a31b-0ab614482e27',
        '01d3bd64-270e-4a04-83da-f72cdd8717c4',
      ],
    },
  },
  serverFiles: [
    {
      id: 'b9050ef5-0d98-41c4-aba1-b0fc5a65a442',
      fileName: 'splnomocnenie.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
    {
      id: '4110b6da-0dd7-4007-8c13-896134f1eaa0',
      fileName: 'stavba-pisomnosti.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
    {
      id: '8bfd16c6-49d5-45d2-987e-cba0ff0ebdd9',
      fileName: 'stavba-fotodokumentacia.jpg',
      fileSize: 0,
      status: 'SAFE',
    },
    {
      id: '1cdcb500-7f11-45d1-a31b-0ab614482e27',
      fileName: 'projektova-dokumentacia-1.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
    {
      id: '01d3bd64-270e-4a04-83da-f72cdd8717c4',
      fileName: 'projektova-dokumentacia-2.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
  ],
}

export default exampleForm
