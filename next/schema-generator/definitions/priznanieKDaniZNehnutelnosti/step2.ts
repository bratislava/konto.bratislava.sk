import {
  conditionalFields,
  fileUpload,
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
import { fyzickaOsoba, fyzickaOsobaPodnikatel, pravnickaOsoba } from './osoby'

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
