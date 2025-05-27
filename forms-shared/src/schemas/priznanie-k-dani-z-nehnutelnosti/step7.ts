import { createCondition } from '../../generator/helpers'
import { bezpodieloveSpoluvlastnictvoManzelov } from './osoby'
import { conditionalStep } from '../../generator/functions/conditionalStep'

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
          [stepKey, 'array:priznania', 'spoluvlastnictvo'],
          {
            type: 'string',
            enum: ['bezpodieloveSpoluvlastnictvoManzelov'],
          },
        ],
      ]),
    ),
  },
  { title: 'Údaje o manželovi/manželke' },
  bezpodieloveSpoluvlastnictvoManzelov,
)
