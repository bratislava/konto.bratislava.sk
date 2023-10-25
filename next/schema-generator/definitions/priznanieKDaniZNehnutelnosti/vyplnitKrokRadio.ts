import { conditionalFields, markdownText, object, radioButton } from '../../generator/functions'
import { createCondition } from '../../generator/helpers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SecondArg<F> = F extends (arg1: any, arg2: infer A, ...rest: any[]) => any ? A : never

export const vyplnitKrokRadio = (fields: SecondArg<typeof conditionalFields>) => [
  object(
    'vyplnitObject',
    {},
    {
      objectDisplay: 'boxed',
      title: 'Chcete podať daňové priznanie k dani z pozemkom?',
      description: markdownText(
        'Vysvetlene k comu sa podava DP k pozemkom. Lorem ipsum dolor sit amet consectetur. Urna mauris feugiat velit at sapien. Nulla vitae sollicitudin sagittis dignissim dolor neque. Neque et elementum commodo at tincidunt. Non ultricies eu id suspendisse volutpat viverra libero tincidunt.\n\n::form-image-preview[Zobraziť ukážku]{#https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg}',
      ),
    },
    [
      radioButton(
        'vyplnit',
        {
          type: 'boolean',
          title: 'Vyplniť priznanie?',
          required: true,
          options: [
            { value: true, title: 'Áno' },
            { value: false, title: 'Nie', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
        },
      ),
    ],
  ),
  conditionalFields(createCondition([[['vyplnitObject', 'vyplnit'], { const: true }]]), fields),
]
