import DatePicker from '../../forms/widget-components/DateTimePicker/DatePicker'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const DatePickerShowCase = () => {
  return (
    <Wrapper direction="column" title="Date Picker">
      <Stack direction="column">
        <DatePicker label="Label" />
        <DatePicker label="Label" errorMessage={['Error message']} />
        <DatePicker label="Label" errorMessage={['Error message']} disabled />
      </Stack>
      <Stack direction="column">
        <DatePicker label="Label" tooltip="Date Picker" helptext="Help text" required />
        <DatePicker
          label="Label"
          errorMessage={['Error message']}
          tooltip="Date Picker"
          helptext="Help text"
          required
        />
        <DatePicker
          label="Label"
          errorMessage={['Error message']}
          tooltip="Date Picker"
          helptext="Help text"
          required
          disabled
        />
      </Stack>
    </Wrapper>
  )
}

export default DatePickerShowCase
