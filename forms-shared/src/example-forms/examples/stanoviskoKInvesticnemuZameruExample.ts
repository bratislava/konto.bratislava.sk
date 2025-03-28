import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'stanoviskoKInvesticnemuZameruExample',
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
      druhStavby: 'bytovyDom',
      ulica: 'Dunajská',
      supisneCislo: '464',
      parcelneCislo: '56789',
      katastralneUzemia: ['805211', '806099'],
    },
    prilohy: {
      architektonickaStudia: ['cb1e3a95-f9d2-4e55-b482-8e7919f2b43f'],
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
      id: 'cb1e3a95-f9d2-4e55-b482-8e7919f2b43f',
      fileName: 'architektonicka-studia.pdf',
      fileSize: 0,
      status: 'SAFE',
    },
  ],
}

export default exampleForm
