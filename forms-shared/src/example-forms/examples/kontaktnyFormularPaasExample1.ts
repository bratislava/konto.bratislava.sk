import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'kontaktnyFormularPaasExample1',
  formData: {
    udaje: {
      kategoria: 'upozornenieONespravnomParkovani',
      cisloZiadostiEcv: 'BA123AB',
      sprava:
        'Dostal som upozornenie o nesprávnom parkovaní, no v čase parkovania som mal platnú parkovaciu kartu. Žiadam o preverenie.',
      prilohy: ['b1feb5ae-da31-4619-a735-c3389dc9e17b'],
      kontaktneUdaje: {
        menoPriezviskoObchodneMeno: 'Ján Kováč',
        email: 'jan.kovac@priklad.sk',
      },
    },
  },
  serverFiles: [
    {
      id: 'b1feb5ae-da31-4619-a735-c3389dc9e17b',
      fileName: 'upozornenie.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
  ],
}

export default exampleForm
