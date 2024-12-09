import { checkbox, conditionalFields, GeneratorField, object } from '../../generator/functions'
import { createCondition } from '../../generator/helpers'

export const kalkulackaFields = ({
  title,
  checkboxLabel,
  helptext,
  inner,
}: {
  title: string
  checkboxLabel: string
  helptext: string
  inner: (kalkulacka: boolean) => GeneratorField
}) => [
  object(
    'kalkulackaWrapper',
    {},
    {
      objectDisplay: 'boxed',
    },
    [
      checkbox(
        'pouzitKalkulacku',
        {
          title,
          required: true,
          default: true,
        },
        {
          variant: 'basic',
          labelSize: 'h3',
          checkboxLabel,
          helptext,
        },
      ),
    ],
  ),
  conditionalFields(
    createCondition([
      [
        ['kalkulackaWrapper', 'pouzitKalkulacku'],
        {
          const: true,
        },
      ],
    ]),
    [inner(true)],
    [inner(false)],
  ),
]
