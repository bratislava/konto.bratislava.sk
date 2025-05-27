import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloTriedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExample',
  formData: {
    ziadatel: {
      typOdberatela: 'Nový',
      platcaDph: false,
      menoKontaktnejOsoby: 'Test Test',
      fakturacia: {
        elektronickaFaktura: true,
        iban: 'SK3112000000198742637541',
        emailPreFaktury: 'test@test.test',
      },
      nazovOrganizacie: 'Test org',
      adresaSidla: {
        ulicaACislo: 'Test 1',
        mestoPsc: {
          mesto: 'Bratislava ',
          psc: '81101',
        },
      },
      ico: '123456',
      dic: '123456',
      telefon: '+421123323232',
      email: 'test@test.test',
    },
    sluzba: {
      infoOOdpade: [
        {
          miestoDodania: 'Test 1',
          druhOdpadu:
            'Papier (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
          pocetNadob: 1,
          objemNadobyPapierPlasty: '120 l zberná nádoba',
          frekvenciaOdvozovPapierPlasty: '1 x do týždňa',
        },
      ],
      emailPotvrdeniePouzitIny: false,
    },
    suhlasy: {
      suhlasSVop: true,
    },
  },
}

export default exampleForm
