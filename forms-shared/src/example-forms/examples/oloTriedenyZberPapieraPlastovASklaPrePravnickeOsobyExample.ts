import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloTriedenyZberPapieraPlastovASklaPrePravnickeOsobyExample',
  formData: {
    ziadatel: {
      typOdberatela: 'Zmena poplatkovej povinnosti pre existujúceho zákazníka',
      nazovOrganizacie: 'Odpad s.r.o.',
      adresaSidla: {
        ulicaACislo: 'Karadžičova 1',
        mestoPsc: {
          mesto: 'Bratislava',
          psc: '83100',
        },
      },
      dic: '44542154545',
      platcaDph: true,
      konatel: 'Milan Voda',
      zastupeny: 'Martin Rieka',
      menoKontaktnejOsoby: 'Michal Dunaj',
      telefon: '+421911444555',
      email: 'voda@odpad.com',
      fakturacia: {
        iban: 'SK3112000000198742637541',
        elektronickaFaktura: true,
        emailPreFaktury: 'ceruzka@email.com',
      },
      ico: '445577886655',
      icDph: 'SK98154154848',
      zmenyVPocteNadob: true,
    },
    sluzba: {
      infoOOdpade: [
        {
          miestoDodania: 'Landererova 10',
          druhOdpadu: 'Papier (Pravidelný odvoz odpadových obalov kat. číslo 15)',
          pocetNadob: 1,
          objemNadobyPapier: '3000 l polopodzemný kontajner',
          frekvenciaOdvozov: '1 x do týždňa',
        },
        {
          miestoDodania: 'Landererova 10',
          druhOdpadu: 'Papier (Pravidelný odvoz odpadových obalov kat. číslo 15)',
          pocetNadob: 5,
          objemNadobyPapier: '120 l zberná nádoba',
          frekvenciaOdvozov: '1 x do týždňa',
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
