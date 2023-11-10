// eslint-disable-next-line import/no-extraneous-dependencies
import type { GenericObjectType } from '@rjsf/utils'

import {
  checkbox,
  conditionalFields,
  Field,
  input,
  number,
  object,
  skipUiSchema,
} from '../../generator/functions'
import { createCondition } from '../../generator/helpers'
import { CustomComponentPropertyCalculatorProps } from '../../generator/uiOptionsTypes'

// A/B regex
// A - 0 or any number of digits, not starting with 0
// B - 1 or more digits, not starting with 0
export const ratioRegex = /^(0|[1-9]\d*)\/([1-9]\d*)$/

const getSchemas = (obj: {
  schema: () => GenericObjectType
  uiSchema: () => GenericObjectType
}) => ({
  schema: obj.schema(),
  uiSchema: obj.uiSchema(),
})

export const kalkulackaTest: CustomComponentPropertyCalculatorProps = {
  title: 'Kalkulačka na výpočet výmery nebytového priestoru',
  openButtonLabel: 'Otvoriť kalkulačku',
  buttonLabel: 'Kopírovať výmeru do formulára',
  valueLabel: 'Váš podiel výmery',
  formula: 'ceil(metreStvorcove * evalRatio(pomer))',
  form: getSchemas(
    object(null, {}, {}, [
      number('metreStvorcove', { title: 'Metre štvorcové', required: true }, {}),
      input(
        'pomer',
        {
          title: 'Pomer',
          required: true,
          pattern: ratioRegex,
        },
        {},
      ),
    ]),
  ),
}

export const pouzitKalkulacku = ({
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
    'pouzitKalkulacku',
    {},
    {
      objectDisplay: 'boxed',
    },
    [
      checkbox(
        'kalulackaVypoctu',
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
        ['pouzitKalkulacku', 'kalulackaVypoctu'],
        {
          const: true,
        },
      ],
    ]),
    [inner(true)],
    [skipUiSchema(inner(false))],
  ),
]
