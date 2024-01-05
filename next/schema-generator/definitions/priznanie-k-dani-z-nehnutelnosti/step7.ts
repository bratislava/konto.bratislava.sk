import { conditionalStep } from '../../generator/functions'
import { createCondition } from '../../generator/helpers'
import { bezpodieloveSpoluvlastnictvoManzelov } from './osoby'

export default conditionalStep(
  'bezpodieloveSpoluvlastnictvoManzelov',
  // This hard to read condition verifies if any of the "priznania" is "bezpodielové spoluvlastníctvo manželov".
  {
    anyOf: [
      'danZPozemkov',
      'danZoStaviebJedenUcel',
      'danZoStaviebViacereUcely',
      'danZBytovANebytovychPriestorov',
    ].map((stepKey) =>
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
              priznania: {
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
            required: ['priznania'],
          },
        ],
      ]),
    ),
  },
  { title: 'Údaje o manželovi/manželke' },
  bezpodieloveSpoluvlastnictvoManzelov,
)
