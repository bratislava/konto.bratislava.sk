import {
  conditionalFields,
  inputField,
  numberField,
  radioButton,
  upload,
} from '../../generator/functions'
import {
  createCamelCaseOptions,
  createCamelCaseOptionsV2,
  createCondition,
} from '../../generator/helpers'
import { StepEnum } from './stepEnum'

export const pravnyVztahSpoluvlastnictvo = (step?: StepEnum) => [
  radioButton(
    'pravnyVztah',
    {
      type: 'string',
      title: 'Právny vzťah',
      required: true,
      options: createCamelCaseOptions(
        step === StepEnum.DanZBytovANebytovychPriestorov
          ? ['Vlastník', 'Správca']
          : ['Vlastník', 'Správca', 'Nájomca', 'Užívateľ'],
      ),
    },
    { variant: 'boxed' },
  ),
  radioButton(
    'spoluvlastnictvo',
    {
      type: 'string',
      title: 'Spoluvlastníctvo',
      required: true,
      options: createCamelCaseOptionsV2([
        { title: 'Som jediný vlastník' },
        {
          title: 'Podielové spoluvlastníctvo',
          tooltip:
            'Nehnuteľnosť vlastníte s ďalšou/ďalšími osobou/osobami (váš podiel na LV je napr. 1/2).',
        },
        {
          title: 'Bezpodielové spoluvlastníctvo manželov',
          tooltip:
            'Nehnuteľnosť vlastníte bezpodielovo s manželom/kou (váš podiel na LV je 1/1). Priznanie podáva len jeden z manželov.',
        },
      ]),
    },
    { variant: 'boxed' },
  ),
  conditionalFields(
    createCondition([[['spoluvlastnictvo'], { const: 'podieloveSpoluvlastnictvo' }]]),
    [
      numberField(
        'pocetSpoluvlastnikov',
        { title: 'Zadajte počet spoluvlastníkov', type: 'integer', minimum: 0, required: true },
        {
          helptext: 'Uveďte počet všetkých spoluvlastníkov, vrátane vás (napr. ja + súrodenec = 2)',
        },
      ),
      radioButton(
        'naZakladeDohody',
        {
          type: 'boolean',
          title: 'Podávate priznanie za všetkých spoluvlastníkov na základe dohody?',
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
    ],
  ),
  conditionalFields(
    createCondition([
      [['spoluvlastnictvo'], { const: 'podieloveSpoluvlastnictvo' }],
      [['naZakladeDohody'], { const: true }],
    ]),
    [
      upload(
        'splnomocnenie',
        {
          title:
            'Nahrajte sken dohody o určení zástupcu na podanie priznania k dani z nehnuteľností',
          required: true,
          multiple: true,
        },
        {
          type: 'dragAndDrop',
          helptext:
            'Keďže ste v predošlom kroku zvolili, že priznanie nepodávate vo svojom mene, je nutné nahratie skanu plnej moci. Následne, po odoslaní formulára je potrebné doručiť originál plnej moci v listinnej podobe na oddelenie miestnych daní, poplatkov a licencií. Splnomocnenie sa neprikladá v prípade zákonného zástupcu neplnoletej osoby.',
          belowComponents: [
            {
              type: 'additionalLinks',
              props: {
                links: [{ title: 'Stiahnite si tlačivo dohody o určení zástupcu', href: 'TODO' }],
              },
            },
          ],
        },
      ),
    ],
  ),
  conditionalFields(
    createCondition([[['spoluvlastnictvo'], { const: 'bezpodieloveSpoluvlastnictvoManzelov' }]]),
    [
      inputField(
        'rodneCisloManzelaManzelky',
        { title: 'Rodné číslo manžela/manželky', required: true },
        {
          helptext:
            'Rodné číslo zadávajte s lomítkom. V prípade, že nemá rodné číslo, uveďte dátum narodenia.',
        },
      ),
    ],
  ),
]
