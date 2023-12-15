import { conditionalStep } from '../../generator/functions'
import { createCondition } from '../../generator/helpers'
import { fyzickaOsoba } from './osoby'

export default conditionalStep(
  'bezpodieloveManzelovskeSpoluvlastnictvo',
  {
    anyOf: [
      { stepKey: 'danZPozemkov', arrayKey: 'danZPozemkov' },
      { stepKey: 'danZoStaviebJedenUcel', arrayKey: 'stavby' },
      { stepKey: 'danZoStaviebViacereUcely', arrayKey: 'stavby' },
      { stepKey: 'danZBytovANebytovychPriestorov', arrayKey: 'stavby' },
    ].map(({ stepKey, arrayKey }) =>
      createCondition([
        [
          [stepKey, 'vyplnitObject', 'vyplnit'],
          {
            const: true,
          },
        ],
        [
          [stepKey],
          {
            type: 'object',
            properties: {
              [arrayKey]: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    spoluvlastnictvo: {
                      type: 'string',
                      enum: ['bezpodieloveSpoluvlastnictvoManzelov'],
                    },
                  },
                  required: ['spoluvlastnictvo'],
                },
              },
            },
            required: [arrayKey],
          },
        ],
      ]),
    ),
  },
  { title: 'Údaje o manželovi/manželke' },
  fyzickaOsoba(false, true),
)
