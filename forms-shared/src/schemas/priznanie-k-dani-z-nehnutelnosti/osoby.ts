import { conditionalFields, input, object, radioGroup, select } from '../../generator/functions'
import { createCamelCaseItems, createCondition } from '../../generator/helpers'
import { sharedPhoneNumberField } from '../shared/fields'
import { esbsNationalityCiselnik } from './esbsCiselniky'

enum UlicaCisloTyp {
  FyzickaOsoba = 'FyzickaOsoba',
  FyzickaOsobaPodnikatel = 'FyzickaOsobaPodnikatel',
  PravnickaOsoba = 'PravnickaOsoba',
  BezpodieloveSpoluvlastnictvoManzelov = 'BezpodieloveSpoluvlastnictvoManzelov',
  KorespondencnaAdresa = 'KorespondencnaAdresa',
}

const rodneCisloField = input(
  'rodneCislo',
  { type: 'text', title: 'Rodné číslo', required: true },
  {
    helptext:
      'Rodné číslo zadávajte s lomítkom. V prípade, že nemáte rodné číslo, uveďte dátum narodenia v tvare DD.MM.YYYY.',
  },
)

const priezviskoField = input(
  'priezvisko',
  { type: 'text', title: 'Priezvisko', required: true },
  {},
)

const menoTitulField = object(
  'menoTitul',
  { required: true },
  {
    columns: true,
    columnsRatio: '3/1',
  },
  [
    input('meno', { type: 'text', title: 'Meno', required: true }, {}),
    input('titul', { type: 'text', title: 'Titul' }, {}),
  ],
)

const ulicaCisloFields = (type: UlicaCisloTyp) =>
  object(
    `ulicaCislo${type}`,
    { required: true },
    {
      columns: true,
      columnsRatio: '3/1',
    },
    [
      input(
        'ulica',
        { type: 'text', title: 'Ulica', required: true },
        {
          helptext: {
            [UlicaCisloTyp.FyzickaOsoba]: 'Zadajte ulicu svojho trvalého pobytu.',
            [UlicaCisloTyp.FyzickaOsobaPodnikatel]:
              'Zadajte ulicu miesta podnikania podľa živnostenského registra.',
            [UlicaCisloTyp.PravnickaOsoba]: 'Zadajte ulicu sídla.',
            [UlicaCisloTyp.BezpodieloveSpoluvlastnictvoManzelov]:
              'Zadajte ulicu trvalého pobytu manžela/manželky.',
            [UlicaCisloTyp.KorespondencnaAdresa]: undefined,
          }[type],
        },
      ),
      input('cislo', { type: 'text', title: 'Čislo', required: true }, {}),
    ],
  )

const obecPscField = object(
  'obecPsc',
  { required: true },
  {
    columns: true,
    columnsRatio: '3/1',
  },
  [
    input('obec', { type: 'text', title: 'Obec', required: true }, {}),
    input('psc', { type: 'text', title: 'PSČ', required: true }, {}),
  ],
)

const statField = select(
  'stat',
  {
    title: 'Štát',
    required: true,
    items: esbsNationalityCiselnik.map(({ Name, Code }) => ({
      value: Code,
      label: Name,
      isDefault: Code === '703' ? true : undefined,
    })),
  },
  {},
)

const emailField = (required = true) =>
  input(
    'email',
    { title: 'E-mail', type: 'email', required },
    { helptext: 'E-mailová adresa nám pomôže komunikovať s vami rýchlejšie.' },
  )

const telefonField = (required = true) =>
  sharedPhoneNumberField(
    'telefon',
    required,
    'Telefónne číslo nám pomôže komunikovať s vami rýchlejšie.',
  )

const icoField = input('ico', { type: 'ba-ico', title: 'IČO', required: true }, {})

const pravnaFormaField = select(
  'pravnaForma',
  {
    title: 'Právna forma',
    required: true,
    items: [
      {
        value: '111',
        label: '111 Verejná obchodná spoločnosť',
      },
      {
        value: '112',
        label: '112 Spoločnosť s ručením obmedzeným',
      },
      {
        value: '113',
        label: '113 Komanditná spoločnosť',
      },
      {
        value: '117',
        label: '117 Nadácia',
      },
      {
        value: '118',
        label: '118 Neinvestičný fond',
      },
      {
        value: '119',
        label: '119 Nezisková organizácia',
      },
      {
        value: '121',
        label: '121 Akciová spoločnosť',
      },
      {
        value: '205',
        label: '205 Družstvo',
      },
      {
        value: '271',
        label: '271 Spoločenstvá vlastníkov pozemkov, bytov a pod.',
      },
      {
        value: '301',
        label: '301 Štátny podnik',
      },
      {
        value: '311',
        label: '311 Národná banka Slovenska',
      },
      {
        value: '312',
        label: '312 Banka – štátny peňažný ústav',
      },
      {
        value: '321',
        label: '321 Rozpočtová organizácia',
      },
      {
        value: '331',
        label: '331 Príspevková organizácia',
      },
      {
        value: '381',
        label: '381 Fondy',
      },
      {
        value: '382',
        label: '382 Verejnoprávna inštitúcia',
      },
      {
        value: '421',
        label: '421 Zahraničná osoba',
      },
      {
        value: '434',
        label: '434 Doplnková dôchodková poisťovňa',
      },
      {
        value: '445',
        label: '445 Komoditná burza',
      },
      {
        value: '701',
        label: '701 Združenie (zväz, spolok, spoločnosť, klub a iné)',
      },
      {
        value: '711',
        label: '711 Politická strana, politické hnutie',
      },
      {
        value: '721',
        label: '721 Cirkevná organizácia',
      },
      {
        value: '741',
        label: '741 Stavovská organizácia – profesná komora',
      },
      {
        value: '745',
        label: '745 Komora (s vynimkou profesných komôr)',
      },
      {
        value: '751',
        label: '751 Záujmové združenie právnických osôb',
      },
      {
        value: '801',
        label: '801 Obec (obecný úrad)',
      },
      {
        value: '921',
        label: '921 Medzinárodné organizácie a združenia',
      },
      {
        value: '931',
        label: '931 Zastúpenie zahraničnej právnickej osoby',
      },
    ],
  },
  {},
)

const obchodneMenoAleboNazovField = input(
  'obchodneMenoAleboNazov',
  { type: 'text', title: 'Obchodné meno alebo názov', required: true },
  {},
)

const pravnyVztahKPOField = select(
  'pravnyVztahKPO',
  {
    title: 'Vyberte právny vzťah k právnickej osobe, za ktorú podávate priznanie',
    items: createCamelCaseItems(['štatutárny zástupca', 'zástupca', 'správca'], false),
    required: true,
  },
  {},
)

export const udajeOOpravnenejOsobeNaPodaniePriznania = object(
  'udajeOOpravnenejOsobeNaPodaniePriznania',
  { required: true },
  {
    objectDisplay: 'boxed',
    title: 'Údaje o oprávnenej osobe na podanie priznania',
  },
  [
    pravnyVztahKPOField,
    priezviskoField,
    menoTitulField,
    ulicaCisloFields(UlicaCisloTyp.FyzickaOsoba),
    obecPscField,
    statField,
    emailField(),
    telefonField(),
  ],
)

const korespondencnaAdresaField = radioGroup(
  'korespondencnaAdresaRovnaka',
  {
    type: 'boolean',
    title: 'Je korešpondenčná adresa rovnáká ako adresa trvalého pobytu?',
    required: true,
    items: [
      { value: true, label: 'Áno', isDefault: true },
      { value: false, label: 'Nie' },
    ],
  },
  {
    variant: 'boxed',
    orientations: 'row',
    labelSize: 'h5',
  },
)

export const danovnik = [
  conditionalFields(
    createCondition([
      [['voSvojomMene'], { const: false }],
      [['priznanieAko'], { const: 'pravnickaOsoba' }],
    ]),
    [pravnyVztahKPOField],
  ),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'fyzickaOsoba' }]]), [
    rodneCisloField,
    priezviskoField,
    menoTitulField,
    ulicaCisloFields(UlicaCisloTyp.FyzickaOsoba),
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
    ulicaCisloFields(UlicaCisloTyp.FyzickaOsobaPodnikatel),
  ]),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'pravnickaOsoba' }]]), [
    ulicaCisloFields(UlicaCisloTyp.PravnickaOsoba),
  ]),
  obecPscField,
  statField,
  conditionalFields(
    createCondition([
      [['voSvojomMene'], { const: true }],
      [['priznanieAko'], { const: 'pravnickaOsoba' }],
    ]),
    [udajeOOpravnenejOsobeNaPodaniePriznania],
  ),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'fyzickaOsoba' }]]), [
    object('korespondencnaAdresa', { required: true }, { objectDisplay: 'boxed' }, [
      korespondencnaAdresaField,
      conditionalFields(createCondition([[['korespondencnaAdresaRovnaka'], { const: false }]]), [
        ulicaCisloFields(UlicaCisloTyp.KorespondencnaAdresa),
        obecPscField,
        statField,
      ]),
    ]),
  ]),
  emailField(),
  telefonField(),
]

export const splnomocnenec = [
  conditionalFields(createCondition([[['splnomocnenecTyp'], { const: 'fyzickaOsoba' }]]), [
    priezviskoField,
    menoTitulField,
    ulicaCisloFields(UlicaCisloTyp.FyzickaOsoba),
  ]),
  conditionalFields(createCondition([[['splnomocnenecTyp'], { const: 'pravnickaOsoba' }]]), [
    obchodneMenoAleboNazovField,
    ulicaCisloFields(UlicaCisloTyp.PravnickaOsoba),
  ]),
  obecPscField,
  statField,
  emailField(),
  telefonField(),
]

const rovnakaAdresaField = radioGroup(
  'rovnakaAdresa',
  {
    type: 'boolean',
    title: 'Má trvalý pobyt na rovnakej adrese ako vy?',
    required: true,
    items: [
      { value: true, label: 'Áno', isDefault: true },
      { value: false, label: 'Nie' },
    ],
  },
  {
    variant: 'boxed',
    orientations: 'row',
  },
)

export const bezpodieloveSpoluvlastnictvoManzelov = [
  rodneCisloField,
  priezviskoField,
  menoTitulField,
  rovnakaAdresaField,
  conditionalFields(createCondition([[['rovnakaAdresa'], { const: false }]]), [
    ulicaCisloFields(UlicaCisloTyp.BezpodieloveSpoluvlastnictvoManzelov),
    obecPscField,
    statField,
  ]),
  emailField(false),
  telefonField(false),
]
