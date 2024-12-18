import { createCondition } from '../../generator/helpers'
import { GeneratorField } from '../../generator/generatorTypes'
import { checkbox } from '../../generator/functions/checkbox'
import { object } from '../../generator/object'
import { conditionalFields } from '../../generator/functions/conditionalFields'

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
