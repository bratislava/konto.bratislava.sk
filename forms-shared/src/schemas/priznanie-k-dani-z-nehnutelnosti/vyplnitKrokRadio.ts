import { createCondition } from '../../generator/helpers'
import { radioGroup } from '../../generator/functions/radioGroup'
import { object } from '../../generator/object'
import { conditionalFields } from '../../generator/functions/conditionalFields'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SecondArg<F> = F extends (arg1: any, arg2: infer A, ...rest: any[]) => any ? A : never

export const vyplnitKrokRadio = ({
  title,
  helptext,
  helptextMarkdown,
  fields,
}: {
  title: string
  helptext: string
  helptextMarkdown: boolean
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
          items: [
            { value: true, label: 'Áno' },
            { value: false, label: 'Nie', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
          labelSize: 'h3',
          helptext,
          helptextMarkdown,
        },
      ),
    ],
  ),
  conditionalFields(createCondition([[['vyplnitObject', 'vyplnit'], { const: true }]]), fields),
]
