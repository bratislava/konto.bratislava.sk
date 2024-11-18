import { conditionalFields, object, radioGroup } from '../../generator/functions'
import { createCondition } from '../../generator/helpers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SecondArg<F> = F extends (arg1: any, arg2: infer A, ...rest: any[]) => any ? A : never

export const vyplnitKrokRadio = ({
  title,
  helptextFooter,
  helptextFooterMarkdown,
  fields,
}: {
  title: string
  helptextFooter: string
  helptextFooterMarkdown: boolean
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
          helptextFooter,
          helptextFooterMarkdown,
        },
      ),
    ],
  ),
  conditionalFields(createCondition([[['vyplnitObject', 'vyplnit'], { const: true }]]), fields),
]
