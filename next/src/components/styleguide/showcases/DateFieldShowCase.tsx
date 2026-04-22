import { parseDate } from '@internationalized/date'

import DateField from '@/src/components/fields/DateField'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const DateFieldShowCase = () => (
  <Wrapper direction="row" title="DateField RAC">
    <Stack direction="column">
      <DateField label="Label" />
      <DateField label="Label" value={parseDate('2024-09-01')} />
      <DateField label="Label" errorMessage="Error message" />
      <DateField label="Label" errorMessage="Error message" isDisabled />
      <DateField
        label="Label"
        minValue={parseDate('2024-09-01')}
        maxValue={parseDate('2024-09-30')}
        helptext="min 2024-09-01, max 2024-09-30"
      />
    </Stack>
    <Stack direction="column">
      <DateField label="Label" isRequired helptext="Help text" />
      <DateField
        label="Label"
        isRequired
        value={parseDate('2024-09-01')}
        helptext="Help text"
      />
      <DateField
        label="Label"
        isRequired
        helptext="Help text"
        errorMessage="Error message"
      />
      <DateField
        label="Label"
        helptext="Help text"
        isRequired
        errorMessage="Error message"
        isDisabled
      />
    </Stack>
  </Wrapper>
)

export default DateFieldShowCase
