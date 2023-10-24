import {
  conditionalFields,
  inputField,
  object,
  radioButton,
  selectField,
  step,
  upload,
} from '../../generator/functions'
import { createCamelCaseOptionsV2, createCondition } from '../../generator/helpers'

enum Type {
  FyzickaOsoba,
  FyzickaOsobaPodnikatel,
  PravnickaOsoba,
}

const danovnikBase = (type: Type, splnomocnenie: boolean) => [
  object(
    'ulicaCislo',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      inputField(
        'ulica',
        { title: 'Ulica', required: true },
        {
          size: 'large',
          helptext:
            type === Type.FyzickaOsobaPodnikatel
              ? 'Zadajte ulicu miesta podnikania podľa živnostenského registra'
              : type === Type.PravnickaOsoba
              ? 'Zadajte ulicu sídla'
              : undefined,
        },
      ),
      inputField('cislo', { title: 'Čislo', required: true }, { size: 'large' }),
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
      inputField('obec', { title: 'Obec', required: true }, { size: 'large' }),
      inputField('psc', { title: 'PSČ', required: true, format: 'zip' }, { size: 'large' }),
    ],
  ),
  // TODO Select ciselnik
  inputField('stat', { title: 'Štát', required: true }, { size: 'large' }),
  ...(splnomocnenie
    ? [
        selectField(
          'pravnyVztahKPO',
          {
            title: 'Právny vzťah k PO',
            options: [
              { value: 'male', title: 'Male', tooltip: 'Male' },
              { value: 'female', title: 'Female', tooltip: 'Female' },
            ],
          },
          {
            dropdownDivider: true,
            helptext: 'Vyberte len v prípade, že podávate priznanie za právnickú osobu',
          },
        ),
      ]
    : []),
  inputField(
    'email',
    { title: 'E-mail', type: 'email', required: true },
    { size: 'large', helptext: 'E-mailová adresa nám pomôže komunikovať s vami rýchlejšie.' },
  ),
  inputField(
    'telefon',
    { title: 'Telefónne číslo (v tvare +421...)', required: true, type: 'tel' },
    { helptext: 'Telefónne číslo nám pomôže komunikovať s vami rýchlejšie.', size: 'default' },
  ),
]

const fyzickaOsoba = (splnomocnenie: boolean) => [
  ...(splnomocnenie
    ? []
    : [
        inputField(
          'rodneCislo',
          { title: 'Rodné číslo', required: true },
          {
            size: 'large',
            helptext:
              'Rodné číslo zadávajte s lomítkom. V prípade, že nemáte rodné číslo, uveďte dátum narodenia.',
          },
        ),
      ]),
  inputField(
    'priezvisko',
    { title: 'Priezvisko', required: true },
    {
      size: 'large',
    },
  ),
  object(
    'menoTitul',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      inputField('meno', { title: 'Meno', required: true }, { size: 'large' }),
      inputField('titul', { title: 'Titul' }, { size: 'large' }),
    ],
  ),
  ...danovnikBase(Type.FyzickaOsoba, splnomocnenie),
]

const fyzickaOsobaPodnikatel = [
  inputField(
    'ico',
    { title: 'IČO', required: true },
    {
      size: 'large',
    },
  ),
  inputField(
    'obchodneMenoAleboNazov',
    { title: 'Obchodné meno alebo názov', required: true },
    {
      size: 'large',
    },
  ),
  ...danovnikBase(Type.FyzickaOsobaPodnikatel, false),
]

const pravnickaOsoba = (splnomocnenie: boolean) => [
  ...(splnomocnenie
    ? []
    : [
        inputField(
          'ico',
          { title: 'IČO', required: true },
          {
            size: 'large',
          },
        ),
        selectField(
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
  inputField(
    'obchodneMenoAleboNazov',
    { title: 'Obchodné meno alebo názov', required: true },
    {
      size: 'large',
    },
  ),
  ...danovnikBase(Type.PravnickaOsoba, splnomocnenie),
]

export default step('udajeODanovnikovi', { title: 'Údaje o daňovníkovi' }, [
  radioButton(
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
        spaceTop: 'default',
        title: 'Údaje o oprávnenej osobe na podanie priznania',
      },
      [
        upload(
          'splnomocnenie',
          { title: 'Nahrajte splnomocnenie', required: true, multiple: true },
          {
            type: 'dragAndDrop',
            helptext:
              'Keďže ste v predošlom kroku zvolili, že priznanie nepodávate vo svojom mene, je nutné nahratie skenu plnej moci. Následne, po odoslaní formulára je potrebné doručiť originál plnej moci v listinnej podobe na oddelenie miestnych daní, poplatkov a licencií. Splnomocnenie sa neprikladá v prípade zákonného zástupcu neplnoletej osoby. ',
          },
        ),
        radioButton(
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
  radioButton(
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
  conditionalFields(createCondition([[['priznanieAko'], { const: 'pravnickaOsoba' }]]), [
    object('pravnickaOsoba', { required: true }, {}, pravnickaOsoba(false)),
  ]),
])
