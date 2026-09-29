import { checkbox } from '../../generator/functions/checkbox'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { GeneratorField } from '../../generator/generatorTypes'
import { createCondition } from '../../generator/helpers'
import { object } from '../../generator/object'

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
