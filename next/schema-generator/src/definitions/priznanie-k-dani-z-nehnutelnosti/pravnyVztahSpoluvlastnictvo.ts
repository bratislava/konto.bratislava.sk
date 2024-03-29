import { conditionalFields, fileUpload, number, radioGroup } from '../../generator/functions'
import {
  createCamelCaseOptions,
  createCamelCaseOptionsV2,
  createCondition,
} from '../../generator/helpers'
import { StepEnum } from './stepEnum'

export const pravnyVztahSpoluvlastnictvo = (step?: StepEnum) => [
  radioGroup(
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
  radioGroup(
    'spoluvlastnictvo',
    {
      type: 'string',
      title: 'Spoluvlastníctvo',
      required: true,
      options: createCamelCaseOptionsV2([
        { title: 'Som jediný vlastník' },
        {
          title: 'Podielové spoluvlastníctvo',
          description:
            'Nehnuteľnosť vlastníte s ďalšou/ďalšími osobou/osobami (váš podiel na LV je napr. 1/2).',
        },
        {
          title: 'Bezpodielové spoluvlastníctvo manželov',
          description:
            'Nehnuteľnosť vlastníte bezpodielovo s manželom/kou (váš podiel na LV je 1/1). Priznanie podáva len jeden z manželov. Údaje o manželovi/manželke zadáte na konci tohto formulára.',
        },
      ]),
    },
    { variant: 'boxed' },
  ),
  conditionalFields(
    createCondition([[['spoluvlastnictvo'], { const: 'podieloveSpoluvlastnictvo' }]]),
    [
      number(
        'pocetSpoluvlastnikov',
        { title: 'Zadajte počet spoluvlastníkov', type: 'integer', minimum: 1, required: true },
        {
          size: 'medium',
          helptext:
            'Uveďte počet všetkých spoluvlastníkov, vrátane vás (napr. ja + súrodenec = 2).',
        },
      ),
      radioGroup(
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
      fileUpload(
        'splnomocnenie',
        // TODO: Reconsider required when tax form will be sent online.
        {
          title:
            'Nahrajte sken dohody o určení zástupcu na podanie priznania k dani z nehnuteľností',
          multiple: true,
        },
        {
          type: 'dragAndDrop',
          belowComponents: [
            {
              type: 'additionalLinks',
              props: {
                links: [
                  {
                    title: 'Stiahnite si tlačivo dohody o určení zástupcu',
                    href: 'https://cdn-api.bratislava.sk/strapi-homepage/upload/Dohoda_o_urceni_zastupcu_DZN_56a8433ec7.pdf',
                  },
                ],
              },
            },
          ],
          helptext:
            'Pri dohode o určení zástupcu sa nevyžadujú úradne osvedčené podpisy spoluvlastníkov.',
        },
      ),
    ],
  ),
]
