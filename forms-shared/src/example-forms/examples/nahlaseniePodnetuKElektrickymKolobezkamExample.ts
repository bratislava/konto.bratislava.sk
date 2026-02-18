import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'nahlaseniePodnetuKElektrickymKolobezkamExample',
  formData: {
    podnet: {
      typPodnetu: 'nespravneZaparkovana',
      poskytovatel: 'bolt',
      adresaPodnetu: 'Námestie SNP 1, Bratislava',
      identifikacnyKod: 'BT-8745692',
      fotografia: ['b1feb5ae-da31-4619-a735-c3389dc9e17b'],
    },
  },
  serverFiles: [
    {
      id: 'b1feb5ae-da31-4619-a735-c3389dc9e17b',
      fileName: 'fotografia-podnetu.jpg',
      fileSize: 0,
      status: 'SAFE',
    },
  ],
}

export default exampleForm
