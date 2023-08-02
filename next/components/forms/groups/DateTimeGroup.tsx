import { useControlledState } from '@react-stately/utils'
import cx from 'classnames'

import FieldErrorMessage from '../info-components/FieldErrorMessage'
import DatePicker, { DatePickerProps } from '../widget-components/DateTimePicker/DatePicker'
import TimePicker, { TimePickerProps } from '../widget-components/DateTimePicker/TimePicker'

type TDatePicker = {
  DateLabel: DatePickerProps['label']
  DateTooltip?: DatePickerProps['tooltip']
  DateDescription?: DatePickerProps['helptext']
  DateRequired?: DatePickerProps['required']
  DateExplicitOptional?: DatePickerProps['explicitOptional']
  DateDisabled?: DatePickerProps['disabled']
  DateValue?: DatePickerProps['value']
  DateOnChange?: DatePickerProps['onChange']
  DateErrorMessage?: DatePickerProps['errorMessage']
}

type TTimePicker = {
  TimeLabel: TimePickerProps['label']
  TimeTooltip?: TimePickerProps['tooltip']
  TimeDescription?: TimePickerProps['helptext']
  TimeRequired?: TimePickerProps['required']
  TimeExplicitOptional?: TimePickerProps['explicitOptional']
  TimeDisabled?: TimePickerProps['disabled']
  TimeValue?: TimePickerProps['value']
  TimeOnChange?: TimePickerProps['onChange']
  TimeErrorMessage?: TimePickerProps['errorMessage']
}

export const DateTimePicker = ({
  DateLabel,
  DateErrorMessage,
  DateTooltip,
  DateDescription,
  DateDisabled,
  DateExplicitOptional,
  DateRequired,
  DateOnChange = () => {},
  DateValue,

  TimeDisabled,
  TimeDescription,
  TimeLabel,
  TimeRequired,
  TimeTooltip,
  TimeErrorMessage,
  TimeExplicitOptional,
  TimeOnChange,
  TimeValue,
}: TDatePicker & TTimePicker) => {
  const [dateControlled, setDateControlled] = useControlledState(DateValue, null, DateOnChange)

  return (
    <div className={cx('flex flex-col items-start')}>
      <div className="flex flex-col items-end gap-4 lg:flex-row">
        <div className={cx('flex w-[320px] flex-col')}>
          <DatePicker
            label={DateLabel}
            errorMessage={DateErrorMessage}
            tooltip={DateTooltip}
            helptext={DateDescription}
            disabled={DateDisabled}
            explicitOptional={DateExplicitOptional}
            value={dateControlled}
            customErrorPlace
            onChange={setDateControlled}
            required={DateRequired}
          />
          {/* Custom render error messages for both fields at small screens */}
          <div className={cx('block flex flex-col lg:hidden')}>
            <FieldErrorMessage errorMessage={DateErrorMessage} />
          </div>
        </div>
        <div className={cx('flex w-[320px] flex-col gap-1')}>
          <TimePicker
            errorMessage={TimeErrorMessage}
            disabled={TimeDisabled}
            helptext={TimeDescription}
            label={TimeLabel}
            required={TimeRequired}
            tooltip={TimeTooltip}
            value={TimeValue}
            customErrorPlace
            onChange={TimeOnChange}
            explicitOptional={TimeExplicitOptional}
          />
          {/* Custom render error messages for both fields at small screens */}
          <div className={cx('block flex flex-col lg:hidden')}>
            <FieldErrorMessage errorMessage={TimeErrorMessage} />
          </div>
        </div>
      </div>

      {/* Custom render error messages for both fields */}
      <div className="flex flex-row gap-4">
        <div className={cx('flex hidden flex-col lg:block lg:w-[320px]')}>
          <FieldErrorMessage errorMessage={DateErrorMessage} />
        </div>
        <div className={cx('flex hidden flex-col lg:block lg:w-[320px]')}>
          <FieldErrorMessage errorMessage={TimeErrorMessage} />
        </div>
      </div>
    </div>
  )
}
