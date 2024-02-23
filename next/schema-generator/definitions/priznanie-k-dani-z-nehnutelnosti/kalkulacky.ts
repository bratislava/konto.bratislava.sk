import { checkbox, conditionalFields, Field, object, skipUiSchema } from '../../generator/functions'
import { createCondition } from '../../generator/helpers'

export const kalkulackaFields = ({
  title,
  checkboxLabel,
  helptextHeader,
  inner,
}: {
  title: string
  checkboxLabel: string
  helptextHeader: string
  inner: (kalkulacka: boolean) => Field
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
          helptextHeader,
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
    [skipUiSchema(inner(false))],
  ),
]
