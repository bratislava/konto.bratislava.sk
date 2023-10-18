// eslint-disable-next-line import/no-extraneous-dependencies
import type { GenericObjectType } from '@rjsf/utils'

import { inputField, numberField, object } from '../../generator/functions'
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
      numberField('metreStvorcove', { title: 'Metre štvorcové', required: true }, {}),
      inputField(
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
