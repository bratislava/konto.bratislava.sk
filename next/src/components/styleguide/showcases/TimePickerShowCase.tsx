import { parseTime } from '@internationalized/date'

import TimeField from '@/src/components/fields/TimeField'
import TimePicker from '@/src/components/widget-components/DateTimePicker/TimePicker'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const TimePickerShowCase = () => {
  return (
    <>
      <Wrapper direction="row" title="TimeField RAC">
        <Stack direction="column">
          <TimeField label="Label" />
          <TimeField label="Label" errorMessage="Error message" />
          <TimeField label="Label" isDisabled />
          <TimeField label="Label" minValue={parseTime('08:00')} helptext="min 08:00" />
          <TimeField label="Label" maxValue={parseTime('17:00')} helptext="max 17:00" />
          <TimeField
            label="Label"
            minValue={parseTime('08:00')}
            maxValue={parseTime('17:00')}
            helptext="min 08:00, max 17:00"
          />
        </Stack>
        <Stack direction="column">
          <TimeField label="Label" isRequired helptext="Help text" />
          <TimeField
            label="Label"
            errorMessage="Error message"
            isRequired
            helptext="Help text"
          />
          <TimeField label="Label" isDisabled isRequired helptext="Help text" />
        </Stack>
      </Wrapper>

      {/* TODO remove */}
      <Wrapper direction="column" title="Time Picker OLD">
        <Stack direction="column">
          <TimePicker label="Label" />
          <TimePicker label="Label" errorMessage={['Error message']} />
          <TimePicker label="Label" isDisabled />
        </Stack>
        <Stack direction="column">
          <TimePicker label="Label" isRequired helptext="Help text" />
          <TimePicker
            label="Label"
            errorMessage={['Error message']}
            isRequired
            helptext="Help text"
          />
          <TimePicker label="Label" isDisabled isRequired helptext="Help text" />
        </Stack>
      </Wrapper>
    </>
  )
}

export default TimePickerShowCase
