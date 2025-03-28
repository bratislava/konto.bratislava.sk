import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloPodnetyAPochvalyObcanovExample',
  formData: {
    podnet: {
      kategoriaPodnetu: 'pracovniciOLO',
      adresa: 'Kvetná 13',
      meno: 'Ján',
      priezvisko: 'Mrkva',
      telefon: '+421911555444',
      email: 'mrkva@jan.sk',
      sprava: 'I am testing OLO submissions.',
      prilohy: ['49c3b893-0a3a-4fdf-9f59-61aa58ed0d0e'],
      datumCasUdalosti: '2023-10-07',
    },
  },
  serverFiles: [
    {
      id: '49c3b893-0a3a-4fdf-9f59-61aa58ed0d0e',
      fileName: 'test1.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
  ],
}

export default exampleForm
