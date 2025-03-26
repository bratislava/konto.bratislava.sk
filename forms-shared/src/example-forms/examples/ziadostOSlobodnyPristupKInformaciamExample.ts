import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'ziadostOSlobodnyPristupKInformaciamExample',
  formData: {
    ziadatel: {
      typZiadatela: 'fyzickaOsoba',
      meno: 'Martin',
      priezvisko: 'Kováč',
      ulicaCislo: 'Bajkalská 28',
      mesto: 'Bratislava',
      psc: '82109',
      kontaktneUdaje: {
        email: 'martin.kovac@example.com',
        telefon: '+421908123456',
      },
    },
    pozadovaneInformacie: {
      predmetZiadosti: 'Rozpočet mestskej časti na rok 2024',
      obsahZiadosti:
        'Žiadam o sprístupnenie dokumentácie týkajúcej sa schváleného rozpočtu mestskej časti Bratislava-Ružinov na rok 2024 vrátane všetkých plánovaných investícií do verejnej infraštruktúry.',
      prilohyZiadosti: ['b9050ef5-0d98-41c4-aba1-b0fc5a65a443'],
    },
    sposobSpristupnenia: {
      sposobSpristupnenia: 'email',
      emailSpristupnenia: 'martin.kovac@example.com',
    },
  },
  serverFiles: [
    {
      id: 'b9050ef5-0d98-41c4-aba1-b0fc5a65a443',
      fileName: 'ziadost_o_rozpocet.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
  ],
}

export default exampleForm
