import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'zavazneStanoviskoKInvesticnejCinnostiExample',
  formData: {
    ziadatel: {
      ziadatelTyp: 'fyzickaOsoba',
      email: 'jan.kovac@priklad.sk',
      telefon: '+421905987654',
      meno: 'Ján',
      priezvisko: 'Kováč',
      ulicaACislo: 'Mierová 12',
      mesto: 'Bratislava',
      psc: '82108',
    },
    stavebnik: {
      stavebnikZiadatelom: false,
      splnomocnenie: 'b9050ef5-0d98-41c4-aba1-b0fc5a65a442',
      ziadatelTyp: 'fyzickaOsoba',
      email: 'marta.novakova@priklad.sk',
      telefon: '+421902123456',
      meno: 'Marta',
      priezvisko: 'Nováková',
      ulicaACislo: 'Šancová 56',
      mesto: 'Bratislava',
      psc: '83104',
    },
    zodpovednyProjektant: {
      meno: 'Peter',
      priezvisko: 'Horváth',
      email: 'peter.horvath@priklad.sk',
      telefon: '+421911654321',
      autorizacneOsvedcenie: '123456789',
      datumSpracovania: '2024-07-04',
    },
    stavba: {
      nazov: 'Nový Bytový Dom',
      idStavby: 'BYT-2024-001',
      ulica: 'Dunajská',
      supisneCislo: '1234',
      parcelneCisla: '56789',
      katastralneUzemia: ['805211', '806099'],
      clenenieStavby: {
        hlavnaStavba: 'Stavba 01 - Bytový dom Luna',
        clenenieHlavnejStavby: 'SO 01 Hlavná budova, SO 02 Podzemné garáže',
        hlavnaStavbaPodlaUcelu: '1120 - VIACBYTOVÉ BUDOVY',
        ostatneStavby: 'Stavba 02 - Oplotenie - SO 01\nStavba 03 - Prípojky - SO 01, SO 02, SO 03',
        obsahujeByty: true,
        pocetBytovCelkovo: 24,
        pocet1IzbovychBytov: 6,
        pocet2IzbovychBytov: 12,
        pocet3IzbovychBytov: 4,
        pocet4IzbovychBytov: 2,
        pocetViacAko4IzbovychBytov: 0,
      },
    },
    typZiadosti: {
      typ: 'stavebnyZamerNavrhovanaStavba',
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
