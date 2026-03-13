import TimePicker from '@/src/components/widget-components/DateTimePicker/TimePicker'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const TimePickerShowCase = () => {
  return (
    <Wrapper direction="column" title="Time Picker">
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
  )
}

export default TimePickerShowCase
