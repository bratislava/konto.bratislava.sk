import { conditionalFields, object, radioButton } from '../../generator/functions'
import { createCondition } from '../../generator/helpers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SecondArg<F> = F extends (arg1: any, arg2: infer A, ...rest: any[]) => any ? A : never

export const vyplnitKrokRadio = (fields: SecondArg<typeof conditionalFields>) => [
  object(
    'vyplnitObject',
    {},
    {
      objectDisplay: 'boxed',
    },
    [
      radioButton(
        'vyplnit',
        {
          type: 'boolean',
          title: 'Zobraziť?',
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
