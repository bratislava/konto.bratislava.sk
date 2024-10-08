import { ExampleForm } from '../types'

const exampleForm: ExampleForm = {
  name: 'oloUzatvorenieZmluvyONakladaniSOdpadom',
  formData: {
    ziadatel: {
      ziadatelTyp: 'Právnická osoba s povolením na vstup do ZEVO',
      telefon: '+421977444666',
      email: 'email@zevo.sk',
      sposobPlatby: 'Platba na faktúru',
      nazov: 'ZEVO s.r.o.',
      ico: '4845485454',
      cisloPovoleniaNaVstup: '123/55',
      elektronickaFaktura: false,
      iban: 'SK3112000000198742637541',
    },
    povodcaOdpadu: {
      stePovodcaOdpadu: true,
    },
    drzitelOdpadu: {
      steDrzitelOdpadu: false,
      typDrzitelaOdpadu: 'Právnická osoba',
      emailDrzitelaOdpadu: 'velo@odpad.sk',
      nazovOrganizacie: 'Velo s.r.o.',
      sidloOrganizacie: {
        ulicaACislo: 'Veľká 10',
        mestoPsc: {
          mesto: 'Nitra',
          psc: '88877',
        },
      },
      ico: '545123545',
    },
    vyberDruhuOdpadu: {
      separovaneZlozky: ['20_01_10', '20_01_08'],
      odpadyZoZahrad: [],
      ineKomunalneOdpady: [],
      odpadyZAerobnejUpravy: [],
      odpadyZCistiarni: [],
      odpadyZUpravyVody: [],
      odpadyZMechanickehoSpracovania: [],
      odpadyZPorodnictva: ['18_01_04'],
      odpadyZVeterinarnehoVyskumu: [],
      drevoSkloPlasty: [],
      izolacneMaterialy: [],
      ineOdpadyZoStavieb: [],
      stareVozidla: [],
      vyrobneZarze: [],
      obaly: [],
      absorbenty: [],
      odpadyZTvarovania: [],
      odpadyZElektrarni: [],
      odpadyZVyrobySkla: [],
      odpadyZFotografickehoPriemyslu: [],
      odpadyZFariebALakov: [],
      odpadyZInychNaterovychHmot: ['08_02_01'],
      odpadyZTlaciarenskychFarieb: [],
      odpadyZLepidiel: [],
      odpadyZPlastov: [],
      odpadyZFarmaceutickychVyrobkov: [],
      odpadyZTukovAMydiel: ['07_06_12'],
      odpadyZCistychChemikalii: [],
      odpadyZPyrolyznehoSpracovania: [],
      odpadyZKoziarskehoPriemyslu: [],
      odpadyZTextilnehoPriemyslu: [],
      odpadyZoSpracovaniaDreva: [],
      odpadyZVyrobyPapiera: [],
      odpadyZPolnohospodarstva: [],
      odpadyZPripravyMasa: [],
      odpadyZoSpracovaniaOvocia: [],
      odpadyZPriemysluMliecnychVyrobkov: [],
      odpadyZPekarenskehoACukrovinkarskeho: [],
      odpadyZVyrobyNapojov: [],
    },
    informacieOMnozstve: {
      predpokladaneMnozstvo: 54,
    },
    suhlasy: {
      suhlas: true,
    },
  },
}

export default exampleForm
