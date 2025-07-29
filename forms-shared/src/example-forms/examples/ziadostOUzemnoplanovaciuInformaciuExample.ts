import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'ziadostOUzemnoplanovaciuInformaciuExample',
  formData: {
    ziadatel: {
      typZiadatela: 'fyzickaOsoba',
      meno: 'Jana',
      priezvisko: 'Svobodová',
      ulicaCislo: 'Ružinovská 15',
      mesto: 'Bratislava',
      psc: '82109',
      kontaktneUdaje: {
        email: 'jana.svobodova@priklad.sk',
        telefon: '+421917654321',
      },
      formaDorucovania: 'email',
    },
    detailAUcel: {
      katastralneUzemie: '809985',
      informacieOLokalite: {
        lokality: [
          {
            parcelneCislo: '1245/2',
            registerParcely: 'registerCKn',
            ulicaACislo: 'Tomášikova 32',
          },
        ],
      },
      ucelUzemnoplanovacichiInformacii: 'planovanyInvesticnyZamer',
      popisZameru:
        'Plánovaná výstavba rodinného domu s garážou na parcele č. 1245/2 v katastrálnom území Ružinov.',
    },
    prilohy: {
      zakresZaujmovychParciel: ['2eb663ad-8ea7-423b-958a-c1830f656d52'],
    },
  },
  serverFiles: [
    {
      id: '2eb663ad-8ea7-423b-958a-c1830f656d52',
      fileName: 'zakres-zaujmovych-parciel.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
  ],
}

export default exampleForm
