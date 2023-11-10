import {
  conditionalFields,
  fileUpload,
  input,
  object,
  radioGroup,
  select,
  step,
} from '../../generator/functions'
import {
  createCamelCaseOptions,
  createCamelCaseOptionsV2,
  createCondition,
} from '../../generator/helpers'

enum Type {
  FyzickaOsoba,
  FyzickaOsobaPodnikatel,
  PravnickaOsoba,
}

const danovnikBase = (type: Type) => [
  object(
    'ulicaCislo',
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
          helptext:
            type === Type.FyzickaOsobaPodnikatel
              ? 'Zadajte ulicu miesta podnikania podľa živnostenského registra'
              : type === Type.PravnickaOsoba
              ? 'Zadajte ulicu sídla'
              : undefined,
        },
      ),
      input('cislo', { title: 'Čislo', required: true }, {}),
    ],
  ),
  object(
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
  ),
  // TODO Select ciselnik
  input('stat', { title: 'Štát', required: true }, {}),
  input(
    'email',
    { title: 'E-mail', type: 'email', required: true },
    { helptext: 'E-mailová adresa nám pomôže komunikovať s vami rýchlejšie.' },
  ),
  input(
    'telefon',
    { title: 'Telefónne číslo (v tvare +421...)', required: true, type: 'tel' },
    { helptext: 'Telefónne číslo nám pomôže komunikovať s vami rýchlejšie.', size: 'medium' },
  ),
]

const fyzickaOsoba = (splnomocnenie: boolean) => [
  ...(splnomocnenie
    ? []
    : [
        input(
          'rodneCislo',
          { title: 'Rodné číslo', required: true },
          {
            helptext:
              'Rodné číslo zadávajte s lomítkom. V prípade, že nemáte rodné číslo, uveďte dátum narodenia.',
          },
        ),
      ]),
  input('priezvisko', { title: 'Priezvisko', required: true }, {}),
  object(
    'menoTitul',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [input('meno', { title: 'Meno', required: true }, {}), input('titul', { title: 'Titul' }, {})],
  ),
  ...danovnikBase(Type.FyzickaOsoba),
]

const fyzickaOsobaPodnikatel = [
  input('ico', { title: 'IČO', required: true }, {}),
  input('obchodneMenoAleboNazov', { title: 'Obchodné meno alebo názov', required: true }, {}),
  ...danovnikBase(Type.FyzickaOsobaPodnikatel),
]

const pravnickaOsoba = (splnomocnenie: boolean) => [
  ...(splnomocnenie
    ? []
    : [
        input('ico', { title: 'IČO', required: true }, {}),
        select(
          'pravnaForma',
          {
            title: 'Právna forma',
            required: true,
            options: [
              { value: 'male', title: 'Male', tooltip: 'Male' },
              { value: 'female', title: 'Female', tooltip: 'Female' },
            ],
          },
          { dropdownDivider: true },
        ),
      ]),
  input('obchodneMenoAleboNazov', { title: 'Obchodné meno alebo názov', required: true }, {}),
  ...danovnikBase(Type.PravnickaOsoba),
]

export default step('udajeODanovnikovi', { title: 'Údaje o daňovníkovi' }, [
  radioGroup(
    'voSvojomMene',
    {
      type: 'boolean',
      title: 'Podávate priznanie k dani z nehnuteľností vo svojom mene?',
      required: true,
      options: [
        { value: true, title: 'Áno', isDefault: true },
        { value: false, title: 'Nie', tooltip: 'TODO' },
      ],
    },
    { variant: 'boxed', orientations: 'row' },
  ),
  conditionalFields(createCondition([[['voSvojomMene'], { const: false }]]), [
    object(
      'opravnenaOsoba',
      { required: true },
      {
        objectDisplay: 'boxed',
        title: 'Údaje o oprávnenej osobe na podanie priznania',
      },
      [
        fileUpload(
          'splnomocnenie',
          { title: 'Nahrajte splnomocnenie', required: true, multiple: true },
          {
            type: 'dragAndDrop',
            helptext:
              'Keďže ste v predošlom kroku zvolili, že priznanie nepodávate vo svojom mene, je nutné nahratie skenu plnej moci. Následne, po odoslaní formulára je potrebné doručiť originál plnej moci v listinnej podobe na oddelenie miestnych daní, poplatkov a licencií. Splnomocnenie sa neprikladá v prípade zákonného zástupcu neplnoletej osoby. ',
          },
        ),
        radioGroup(
          'splnomocnenecTyp',
          {
            type: 'string',
            title: 'Podávate ako oprávnená osoba (splnomocnenec)',
            required: true,
            options: createCamelCaseOptionsV2([
              { title: 'Fyzická osoba', description: 'Občan SR alebo cudzinec' },
              {
                title: 'Právnicka osoba',
                description:
                  'Organizácia osôb alebo majetku vytvorená na nejaký účel (napr. podnikanie)',
              },
            ]),
          },
          { variant: 'boxed' },
        ),
        conditionalFields(createCondition([[['splnomocnenecTyp'], { const: 'fyzickaOsoba' }]]), [
          object('fyzickaOsoba', { required: true }, {}, fyzickaOsoba(true)),
        ]),
        conditionalFields(createCondition([[['splnomocnenecTyp'], { const: 'pravnickaOsoba' }]]), [
          object('pravnickaOsoba', { required: true }, {}, pravnickaOsoba(true)),
        ]),
      ],
    ),
  ]),
  radioGroup(
    'priznanieAko',
    {
      type: 'string',
      title: 'Podávate priznanie ako',
      required: true,
      options: createCamelCaseOptionsV2([
        { title: 'Fyzická osoba', description: 'Občan SR alebo cudzinec' },
        { title: 'Fyzická osoba podnikateľ', description: 'SZČO alebo “živnostník”' },
        {
          title: 'Právnicka osoba',
          description: 'Organizácia osôb alebo majetku vytvorená na nejaký účel (napr. podnikanie)',
        },
      ]),
    },
    { variant: 'boxed' },
  ),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'fyzickaOsoba' }]]), [
    object('fyzickaOsoba', { required: true }, {}, fyzickaOsoba(false)),
  ]),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'fyzickaOsobaPodnikatel' }]]), [
    object('fyzickaOsobaPodnikatel', { required: true }, {}, fyzickaOsobaPodnikatel),
  ]),
  conditionalFields(
    createCondition([
      [['priznanieAko'], { const: 'pravnickaOsoba' }],
      [['voSvojomMene'], { const: false }],
    ]),
    [
      select(
        'pravnyVztahKPO',
        {
          title: 'Vyberte právny vzťah k právnickej osobe, za ktorú podávate priznanie',
          options: createCamelCaseOptions(['štatutárny zástupca', 'zástupca', 'správca'], false),
        },
        {
          dropdownDivider: true,
        },
      ),
    ],
  ),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'pravnickaOsoba' }]]), [
    object('pravnickaOsoba', { required: true }, {}, pravnickaOsoba(false)),
  ]),
])
