import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'predzahradkyExample',
  formData: {
    ziadatel: {
      meno: 'Ján',
      priezvisko: 'Kováč',
      ulicaACislo: 'Mierová 12',
      mesto: 'Bratislava',
      psc: '82108',
      email: 'jan.kovac@priklad.sk',
      telefon: '+421905987654',
    },
    predzahradka: {
      typRegistracie: 'nova',
      adresa: 'Dunajská 34',
      mestskaCast: 'SK0101528595',
      parcelneCislo: '46549/435413',
      ine: 'Predzáhradka bude obsahovať rôzne druhy kvetov a kríkov, ktoré budú starostlivo vybrané tak, aby kvitli počas celého roka. Plánujeme tiež inštalovať malé fontány a lavičky pre oddych.',
      rozlozenie:
        'Predzáhradka bude rozdelená na tri sekcie: kvetinovú, kríkovú a relaxačnú zónu s lavičkami. Kvetinová sekcia bude umiestnená pri vstupe, kríková pozdĺž plotu a relaxačná zóna v strede.',
    },
    prilohy: {
      mapa: '4f01b72e-f5d6-429e-a4b4-ecb6432f05f7',
      fotografie: '6f306cec-29c4-45dd-97b8-f9bedcb7d72d',
      projekt: '88b55eff-ebb4-4d17-bc5a-cdbe6d8eb923',
      inePrilohy: '7f3e5eeb-215d-4e55-ac78-44f7d60a699c',
    },
  },
  serverFiles: [
    {
      id: '4f01b72e-f5d6-429e-a4b4-ecb6432f05f7',
      fileName: 'mapa.jpg',
      fileSize: 0,
      status: 'SAFE',
    },
    {
      id: '6f306cec-29c4-45dd-97b8-f9bedcb7d72d',
      fileName: 'fotografie.jpg',
      fileSize: 0,
      status: 'SAFE',
    },
    {
      id: '88b55eff-ebb4-4d17-bc5a-cdbe6d8eb923',
      fileName: 'projekt.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
    {
      id: '7f3e5eeb-215d-4e55-ac78-44f7d60a699c',
      fileName: 'ine-prilohy.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
  ],
}

export default exampleForm
