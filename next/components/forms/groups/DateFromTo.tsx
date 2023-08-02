import { useControlledState } from '@react-stately/utils'
import cx from 'classnames'

import FieldErrorMessage from '../info-components/FieldErrorMessage'
import DatePicker, { DatePickerProps } from '../widget-components/DateTimePicker/DatePicker'

type DateFrom = {
  DateFromLabel: DatePickerProps['label']
  DateFromTooltip?: DatePickerProps['tooltip']
  DateFromDescription?: DatePickerProps['helptext']
  DateFromRequired?: DatePickerProps['required']
  DateFromExplicitOptional?: DatePickerProps['explicitOptional']
  DateFromDisabled?: DatePickerProps['disabled']
  DateFromValue?: DatePickerProps['value']
  DateFromOnChange?: DatePickerProps['onChange']
  DateFromErrorMessage?: DatePickerProps['errorMessage']
}

type DateTo = {
  DateToLabel: DatePickerProps['label']
  DateToTooltip?: DatePickerProps['tooltip']
  DateToDescription?: DatePickerProps['helptext']
  DateToRequired?: DatePickerProps['required']
  DateToExplicitOptional?: DatePickerProps['explicitOptional']
  DateToDisabled?: DatePickerProps['disabled']
  DateToValue?: DatePickerProps['value']
  DateToOnChange?: DatePickerProps['onChange']
  DateToErrorMessage?: DatePickerProps['errorMessage']
}

export const DateFromTo = ({
  DateFromLabel,
  DateToLabel,
  DateFromErrorMessage,
  DateToErrorMessage,
  DateFromTooltip,
  DateToTooltip,
  DateFromRequired,
  DateToRequired,
  DateFromExplicitOptional,
  DateToExplicitOptional,
  DateFromDisabled,
  DateToDisabled,
  DateFromDescription,
  DateToDescription,
  DateFromValue,
  DateToValue,
  DateFromOnChange = () => {},
  DateToOnChange = () => {},
}: DateFrom & DateTo) => {
  const [dateFromControlled, setDateFromControlled] = useControlledState(
    DateFromValue,
    null,
    DateFromOnChange,
  )
  const [dateToControlled, setDateToControlled] = useControlledState(
    DateToValue,
    null,
    DateToOnChange,
  )

  return (
    <div className={cx('flex flex-col items-start')}>
      <div className="items-left flex flex-col gap-4 lg:flex-row">
        <div className={cx('flex w-[320px] flex-col items-start justify-end')}>
          <DatePicker
            label={DateFromLabel}
            errorMessage={DateFromErrorMessage}
            required={DateFromRequired}
            helptext={DateFromDescription}
            tooltip={DateFromTooltip}
            explicitOptional={DateFromExplicitOptional}
            disabled={DateFromDisabled}
            customErrorPlace
            value={dateFromControlled}
            onChange={setDateFromControlled}
          />
          {/* Custom render error messages for both fields at small screens */}
          <div className={cx('block flex flex-col lg:hidden lg:w-[320px]')}>
            <FieldErrorMessage errorMessage={DateFromErrorMessage} />
          </div>
        </div>
        <div className={cx('mb-6 mt-auto hidden h-0.5 bg-gray-300 lg:block lg:w-8')} />
        <div className={cx('flex w-[320px] flex-col')}>
          <DatePicker
            label={DateToLabel}
            errorMessage={DateToErrorMessage}
            tooltip={DateToTooltip}
            required={DateToRequired}
            helptext={DateToDescription}
            explicitOptional={DateToExplicitOptional}
            disabled={DateToDisabled}
            value={dateToControlled}
            customErrorPlace
            onChange={setDateToControlled}
          />
          {/* Custom render error messages for both fields at small screens */}
          <div className={cx('block flex flex-col lg:hidden lg:w-[320px]')}>
            <FieldErrorMessage errorMessage={DateFromErrorMessage} />
          </div>
        </div>
      </div>

      {/* Custom render error messages for both fields */}
      <div className="flex flex-row gap-4">
        <div className={cx('flex hidden flex-col lg:block lg:w-[320px]')}>
          <FieldErrorMessage errorMessage={DateFromErrorMessage} />
        </div>
        <div className={cx('hidden h-0.5 bg-white lg:block lg:w-8')} />
        <div className={cx('flex hidden flex-col lg:block lg:w-[320px]')}>
          <FieldErrorMessage errorMessage={DateToErrorMessage} />
        </div>
      </div>
    </div>
  )
}
