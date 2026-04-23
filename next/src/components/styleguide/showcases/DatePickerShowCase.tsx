import { parseDate } from '@internationalized/date'
import { useState } from 'react'
import { DateValue } from 'react-aria-components'

import DatePicker from '@/src/components/fields/DatePicker/DatePicker'
import DatePickerOLD from '@/src/components/widget-components/DateTimePicker/DatePicker'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const DatePickerShowCase = () => {
  const ERROR_MESSAGES = ['Error message']
  const [value, setValue] = useState<DateValue | null>(parseDate('2024-09-01'))
  const [valueOLD, setValueOLD] = useState<string | null | undefined>('202asdas1-09-01')

  return (
    <>
      <Wrapper direction="row" title="DatePicker RAC">
        <Stack direction="column">
          <DatePicker label="Label" />
          <DatePicker label="Label" errorMessage="Error message" />
          <DatePicker label="Label" errorMessage="Error message" isDisabled />
          <DatePicker
            label="Label"
            minValue={parseDate('2024-09-01')}
            helptext="min 2024-09-01"
          />
          <DatePicker
            label="Label"
            maxValue={parseDate('2024-09-30')}
            helptext="max 2024-09-30"
          />
          <DatePicker
            label="Label"
            minValue={parseDate('2024-09-01')}
            maxValue={parseDate('2024-09-30')}
            helptext="min 2024-09-01, max 2024-09-30"
          />
        </Stack>
        <Stack direction="column">
          <DatePicker label="Label" helptext="Help text" isRequired />
          <DatePicker
            label="Label"
            errorMessage="Error message"
            helptext="Help text"
            isRequired
          />
          <DatePicker
            label="Label"
            errorMessage="Error message"
            helptext="Help text"
            isRequired
            isDisabled
          />
          <DatePicker label="Label" value={value} onChange={setValue} />
        </Stack>
      </Wrapper>

      {/* TODO remove */}
      <Wrapper direction="row" title="Date Picker OLD">
        <Stack direction="column">
          <DatePickerOLD label="Label" />
          <DatePickerOLD label="Label" errorMessage={ERROR_MESSAGES} />
          <DatePickerOLD label="Label" errorMessage={ERROR_MESSAGES} isDisabled />
        </Stack>
        <Stack direction="column">
          <DatePickerOLD label="Label" helptext="Help text" isRequired />
          <DatePickerOLD
            label="Label"
            errorMessage={ERROR_MESSAGES}
            helptext="Help text"
            isRequired
          />
          <DatePickerOLD
            label="Label"
            errorMessage={ERROR_MESSAGES}
            helptext="Help text"
            isRequired
            isDisabled
          />
          <DatePickerOLD label="Label" value={valueOLD} onChange={setValueOLD} />
        </Stack>
      </Wrapper>
    </>
  )
}

export default DatePickerShowCase
