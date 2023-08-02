import DatePicker from '../../forms/widget-components/DateTimePicker/DatePicker'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const DatePickerShowCase = () => {
  const ERROR_MESSAGES = ['Error message']

  return (
    <Wrapper direction="row" title="Date Picker">
      <Stack direction="column">
        <DatePicker label="Label" />
        <DatePicker label="Label" errorMessage={ERROR_MESSAGES} />
        <DatePicker label="Label" errorMessage={ERROR_MESSAGES} disabled />
      </Stack>
      <Stack direction="column">
        <DatePicker label="Label" tooltip="Date Picker" helptext="Help text" required />
        <DatePicker
          label="Label"
          errorMessage={ERROR_MESSAGES}
          tooltip="Date Picker"
          helptext="Help text"
          required
        />
        <DatePicker
          label="Label"
          errorMessage={ERROR_MESSAGES}
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
