import { conditionalFields, input, object, radioGroup, select } from '../../generator/functions'
import { createCamelCaseOptions, createCondition } from '../../generator/helpers'
import { statCiselnik } from './statCiselnik'

enum DanovnikTyp {
  FyzickaOsoba = 'FyzickaOsoba',
  FyzickaOsobaPodnikatel = 'FyzickaOsobaPodnikatel',
  PravnickaOsoba = 'PravnickaOsoba',
  BezpodieloveSpoluvlastnictvoManzelov = 'BezpodieloveSpoluvlastnictvoManzelov',
}

const rodneCisloField = input(
  'rodneCislo',
  { title: 'Rodné číslo', required: true },
  {
    helptext:
      'Rodné číslo zadávajte s lomítkom. V prípade, že nemáte rodné číslo, uveďte dátum narodenia.',
  },
)

const priezviskoField = input('priezvisko', { title: 'Priezvisko', required: true }, {})

const menoTitulField = object(
  'menoTitul',
  { required: true },
  {
    objectDisplay: 'columns',
    objectColumnRatio: '3/1',
  },
  [input('meno', { title: 'Meno', required: true }, {}), input('titul', { title: 'Titul' }, {})],
)

const ulicaCislo = (type: DanovnikTyp) =>
  object(
    `ulicaCislo${type}`,
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      input(
        'ulica',
        { title: 'Ulica', required: true },
        {
          helptext: {
            [DanovnikTyp.FyzickaOsoba]: 'Zadajte ulicu svojho trvalého pobytu.',
            [DanovnikTyp.FyzickaOsobaPodnikatel]:
              'Zadajte ulicu miesta podnikania podľa živnostenského registra.',
            [DanovnikTyp.PravnickaOsoba]: 'Zadajte ulicu sídla.',
            [DanovnikTyp.BezpodieloveSpoluvlastnictvoManzelov]:
              'Zadajte ulicu trvalého pobytu manžela/manželky.',
          }[type],
        },
      ),
      input('cislo', { title: 'Čislo', required: true }, {}),
    ],
  )

const obecPscField = object(
  'obecPsc',
  { required: true },
  {
    objectDisplay: 'columns',
    objectColumnRatio: '3/1',
  },
  [
    input('obec', { title: 'Obec', required: true }, {}),
    input('psc', { title: 'PSČ', required: true, format: 'zip' }, {}),
  ],
)

// TODO ciselnik
const statField = select(
  'stat',
  {
    title: 'Štát',
    required: true,
    options: statCiselnik,
  },
  {},
)

const emailField = input(
  'email',
  { title: 'E-mail', type: 'email', required: true },
  { helptext: 'E-mailová adresa nám pomôže komunikovať s vami rýchlejšie.' },
)

const telefonField = input(
  'telefon',
  { title: 'Telefónne číslo (v tvare +421...)', required: true, type: 'tel' },
  { helptext: 'Telefónne číslo nám pomôže komunikovať s vami rýchlejšie.', size: 'medium' },
)

const icoField = input('ico', { title: 'IČO', required: true }, {})

const pravnaFormaField = select(
  'pravnaForma',
  {
    title: 'Právna forma',
    required: true,
    options: [
      {
        value: '111',
        title: '111 Verejná obchodná spoločnosť',
      },
      {
        value: '112',
        title: '112 Spoločnosť s ručením obmedzeným',
      },
      {
        value: '113',
        title: '113 Komanditná spoločnosť',
      },
      {
        value: '117',
        title: '117 Nadácia',
      },
      {
        value: '118',
        title: '118 Neinvestičný fond',
      },
      {
        value: '119',
        title: '119 Nezisková organizácia',
      },
      {
        value: '121',
        title: '121 Akciová spoločnosť',
      },
      {
        value: '205',
        title: '205 Družstvo',
      },
      {
        value: '271',
        title: '271 Spoločenstvá vlastníkov pozemkov, bytov a pod.',
      },
      {
        value: '301',
        title: '301 Štátny podnik',
      },
      {
        value: '311',
        title: '311 Národná banka Slovenska',
      },
      {
        value: '312',
        title: '312 Banka – štátny peňažný ústav',
      },
      {
        value: '321',
        title: '321 Rozpočtová organizácia',
      },
      {
        value: '331',
        title: '331 Príspevková organizácia',
      },
      {
        value: '381',
        title: '381 Fondy',
      },
      {
        value: '382',
        title: '382 Verejnoprávna inštitúcia',
      },
      {
        value: '421',
        title: '421 Zahraničná osoba',
      },
      {
        value: '433',
        title: '433 Sociálna a zdravotné poisťovne',
      },
      {
        value: '434',
        title: '434 Doplnková dôchodková poisťovňa',
      },
      {
        value: '445',
        title: '445 Komoditná burza',
      },
      {
        value: '701',
        title: '701 Združenie (zväz, spolok, spoločnosť, klub a iné)',
      },
      {
        value: '711',
        title: '711 Politická strana, politické hnutie',
      },
      {
        value: '721',
        title: '721 Cirkevná organizácia',
      },
      {
        value: '741',
        title: '741 Stavovská organizácia – profesná komora',
      },
      {
        value: '745',
        title: '745 Komora (s vynimkou profesných komôr)',
      },
      {
        value: '751',
        title: '751 Záujmové združenie právnických osôb',
      },
      {
        value: '801',
        title: '801 Obec (obecný úrad)',
      },
      {
        value: '802',
        title: '802 Krajský a obvodný úrad',
      },
      {
        value: '921',
        title: '921 Medzinárodné organizácie a združenia',
      },
      {
        value: '931',
        title: '931 Zastúpenie zahraničnej právnickej osoby',
      },
    ],
  },
  {},
)

const obchodneMenoAleboNazovField = input(
  'obchodneMenoAleboNazov',
  { title: 'Obchodné meno alebo názov', required: true },
  {},
)

const pravnyVztahKPOField = select(
  'pravnyVztahKPO',
  {
    title: 'Vyberte právny vzťah k právnickej osobe, za ktorú podávate priznanie',
    options: createCamelCaseOptions(['štatutárny zástupca', 'zástupca', 'správca'], false),
    required: true,
  },
  {},
)

export const danovnik = [
  conditionalFields(
    createCondition([
      [['voSvojomMene'], { const: false }],
      [['priznanieAko'], { const: 'pravnickaOsoba' }],
      [['opravnenaOsoba', 'splnomocnenecTyp'], { const: 'fyzickaOsoba' }],
    ]),
    [pravnyVztahKPOField],
  ),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'fyzickaOsoba' }]]), [
    rodneCisloField,
    priezviskoField,
    menoTitulField,
    ulicaCislo(DanovnikTyp.FyzickaOsoba),
  ]),
  conditionalFields(
    createCondition([[['priznanieAko'], { enum: ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'] }]]),
    [icoField],
  ),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'pravnickaOsoba' }]]), [
    pravnaFormaField,
  ]),
  conditionalFields(
    createCondition([[['priznanieAko'], { enum: ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'] }]]),
    [obchodneMenoAleboNazovField],
  ),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'fyzickaOsobaPodnikatel' }]]), [
    ulicaCislo(DanovnikTyp.FyzickaOsobaPodnikatel),
  ]),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'pravnickaOsoba' }]]), [
    ulicaCislo(DanovnikTyp.PravnickaOsoba),
  ]),
  obecPscField,
  statField,
  emailField,
  telefonField,
]

export const splnomocnenec = [
  conditionalFields(createCondition([[['splnomocnenecTyp'], { const: 'fyzickaOsoba' }]]), [
    priezviskoField,
    menoTitulField,
    ulicaCislo(DanovnikTyp.FyzickaOsoba),
  ]),
  conditionalFields(createCondition([[['splnomocnenecTyp'], { const: 'pravnickaOsoba' }]]), [
    obchodneMenoAleboNazovField,
    ulicaCislo(DanovnikTyp.PravnickaOsoba),
  ]),
  obecPscField,
  statField,
  emailField,
  telefonField,
]

export const bezpodieloveSpoluvlastnictvoManzelov = [
  rodneCisloField,
  priezviskoField,
  menoTitulField,
  radioGroup(
    'rovnakaAdresa',
    {
      type: 'boolean',
      title: 'Má trvalý pobyt na rovnakej adrese ako vy?',
      required: true,
      options: [
        { value: true, title: 'Áno', isDefault: true },
        { value: false, title: 'Nie' },
      ],
    },
    {
      variant: 'boxed',
      orientations: 'row',
    },
  ),
  conditionalFields(createCondition([[['rovnakaAdresa'], { const: false }]]), [
    ulicaCislo(DanovnikTyp.BezpodieloveSpoluvlastnictvoManzelov),
  ]),
  obecPscField,
  statField,
  emailField,
  telefonField,
]
