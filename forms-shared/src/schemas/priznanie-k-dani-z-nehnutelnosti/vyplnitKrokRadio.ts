import { conditionalFields, object, radioGroup } from '../../generator/functions'
import { createCondition } from '../../generator/helpers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SecondArg<F> = F extends (arg1: any, arg2: infer A, ...rest: any[]) => any ? A : never

export const vyplnitKrokRadio = ({
  title,
  helptext,
  fields,
}: {
  title: string
  helptext: string
  fields: SecondArg<typeof conditionalFields>
}) => [
  object(
    'vyplnitObject',
    {},
    {
      objectDisplay: 'boxed',
    },
    [
      radioGroup(
        'vyplnit',
        {
          type: 'boolean',
          title,
          required: true,
          options: [
            { value: true, title: 'Áno' },
            { value: false, title: 'Nie', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
          labelSize: 'h3',
          helptextHeader: helptext,
        },
      ),
    ],
  ),
  conditionalFields(createCondition([[['vyplnitObject', 'vyplnit'], { const: true }]]), fields),
]
