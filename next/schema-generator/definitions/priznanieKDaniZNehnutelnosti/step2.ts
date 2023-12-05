import {
  conditionalFields,
  fileUpload,
  input,
  markdownText,
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
          helptext: {
            [Type.FyzickaOsoba]: 'Zadajte ulicu svojho trvalého pobytu.',
            [Type.FyzickaOsobaPodnikatel]:
              'Zadajte ulicu miesta podnikania podľa živnostenského registra.',
            [Type.PravnickaOsoba]: 'Zadajte ulicu sídla.',
          }[type],
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
        {
          value: false,
          title: 'Nie',
          description:
            'Označte v prípade, že podávate priznanie k dani z nehnuteľností ako oprávnená osoba na základe napr. plnej moci alebo ako zákonný zástupca.',
        },
      ],
    },
    { variant: 'boxed', orientations: 'column' },
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
            helptext: markdownText(
              'Keďže ste v predošlom kroku zvolili, že priznanie nepodávate vo svojom mene, je nutné nahratie skenu plnej moci. Následne, po odoslaní formulára je potrebné doručiť originál plnej moci v listinnej podobe na [oddelenie miestnych daní, poplatkov a licencií](https://bratislava.sk/mesto-bratislava/dane-a-poplatky). Splnomocnenie sa neprikladá v prípade zákonného zástupcu neplnoletej osoby.',
            ),
          },
        ),
        radioGroup(
          'splnomocnenecTyp',
          {
            type: 'string',
            title: 'Podávate ako oprávnená osoba (splnomocnenec)',
            required: true,
            options: createCamelCaseOptionsV2([
              { title: 'Fyzická osoba', description: 'Občan SR alebo cudzinec.' },
              {
                title: 'Právnicka osoba',
                description:
                  'Organizácia osôb alebo majetku vytvorená na určitý účel (napr. podnikanie).',
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
        { title: 'Fyzická osoba', description: 'Občan SR alebo cudzinec.' },
        { title: 'Fyzická osoba podnikateľ', description: 'SZČO alebo živnostník.' },
        {
          title: 'Právnicka osoba',
          description:
            'Organizácia osôb alebo majetku vytvorená na určitý účel (napr. podnikanie).',
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
      [['opravnenaOsoba', 'splnomocnenecTyp'], { const: 'fyzickaOsoba' }],
      [['voSvojomMene'], { const: false }],
    ]),
    [
      select(
        'pravnyVztahKPO',
        {
          title: 'Vyberte právny vzťah k právnickej osobe, za ktorú podávate priznanie',
          options: createCamelCaseOptions(['štatutárny zástupca', 'zástupca', 'správca'], false),
        },
        {},
      ),
    ],
  ),
  conditionalFields(createCondition([[['priznanieAko'], { const: 'pravnickaOsoba' }]]), [
    object('pravnickaOsoba', { required: true }, {}, pravnickaOsoba(false)),
  ]),
])
