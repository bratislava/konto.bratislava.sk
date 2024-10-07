import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloTriedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExample',
  formData: {
    ziadatel: {
      typOdberatela: 'Existujúci',
      nazovOrganizacie: 'Odpad s.r.o.',
      adresaSidla: {
        ulicaACislo: 'Moravská 1',
        mestoPsc: {
          mesto: 'Bratislava',
          psc: '83103',
        },
      },
      dic: '12154564564',
      platcaDph: false,
      menoKontaktnejOsoby: 'Jozef Ceruzka',
      telefon: '+421903654788',
      email: 'ceruzka@email.com',
      iban: 'SK3112000000198742637541',
      elektronickaFaktura: true,
      cisloZmluvy: 'AA554778',
      ico: '4455117788',
      emailPreFaktury: 'ceruzka@email.com',
      zmenyVPocteNadob: false,
    },
    sluzba: {
      infoOOdpade: [
        {
          miestoDodania: 'Moravská 1, Bratislava, 83103',
          druhOdpadu:
            'Plasty (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
          pocetNadob: 4,
          objemNadobyPapierPlasty: '240 l zberná nádoba',
          frekvenciaOdvozovPapierPlasty: '2 x do týždňa',
        },
      ],
      emailPotvrdenie: 'ceruzka@email.com',
    },
    suhlasy: {
      suhlas: true,
    },
  },
}

export default exampleForm
