import { useControlledState } from '@react-stately/utils'
import cx from 'classnames'

import FieldErrorMessage from '../info-components/FieldErrorMessage'
import TimePicker, { TimePickerProps } from '../widget-components/DateTimePicker/TimePicker'

type TimeFromBase = {
  TimeFromLabel: TimePickerProps['label']
  TimeFromDescription?: TimePickerProps['helptext']
  TimeFromTooltip?: TimePickerProps['tooltip']
  TimeFromRequired?: TimePickerProps['required']
  TimeFromExplicitOptional?: TimePickerProps['explicitOptional']
  TimeFromDisabled?: TimePickerProps['disabled']
  TimeFromValue?: TimePickerProps['value']
  TimeFromOnChange?: TimePickerProps['onChange']
  TimeFromErrorMessage?: TimePickerProps['errorMessage']
}
type TimeToBase = {
  TimeToLabel: TimePickerProps['label']
  TimeToDescription?: TimePickerProps['helptext']
  TimeToTooltip?: TimePickerProps['tooltip']
  TimeToRequired?: TimePickerProps['required']
  TimeToExplicitOptional?: TimePickerProps['explicitOptional']
  TimeToDisabled?: TimePickerProps['disabled']
  TimeToValue?: TimePickerProps['value']
  TimeToOnChange?: TimePickerProps['onChange']
  TimeToErrorMessage?: TimePickerProps['errorMessage']
}

export const TimeFromTo = ({
  TimeFromLabel,
  TimeToLabel,
  TimeFromDescription,
  TimeToDescription,
  TimeFromTooltip,
  TimeToTooltip,
  TimeFromRequired,
  TimeToRequired,
  TimeFromExplicitOptional,
  TimeToExplicitOptional,
  TimeFromDisabled,
  TimeToDisabled,
  TimeFromOnChange = () => {},
  TimeToOnChange = () => {},
  TimeFromValue,
  TimeToValue,
  TimeFromErrorMessage,
  TimeToErrorMessage,
}: TimeFromBase & TimeToBase) => {
  const [timeFromControlled, setTimeFromControlled] = useControlledState(
    TimeFromValue,
    null,
    TimeFromOnChange,
  )
  const [timeToControlled, setTimeToControlled] = useControlledState(
    TimeToValue,
    null,
    TimeToOnChange,
  )

  return (
    <div className={cx('flex flex-col')}>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className={cx('flex w-[320px] flex-col items-start')}>
          <TimePicker
            label={TimeFromLabel}
            errorMessage={TimeFromErrorMessage}
            helptext={TimeFromDescription}
            tooltip={TimeFromTooltip}
            required={TimeFromRequired}
            explicitOptional={TimeFromExplicitOptional}
            value={timeFromControlled}
            customErrorPlace
            onChange={setTimeFromControlled}
            disabled={TimeFromDisabled}
          />
          {/* Custom render error messages for both fields at small screens */}
          <div className={cx('block flex flex-col lg:hidden lg:w-[320px]')}>
            <FieldErrorMessage errorMessage={TimeFromErrorMessage} />
          </div>
        </div>
        <div className={cx('mb-6 mt-auto hidden h-0.5 bg-gray-300 lg:block lg:w-8')} />
        <div className={cx('flex w-[320px] flex-col')}>
          <TimePicker
            label={TimeToLabel}
            helptext={TimeToDescription}
            errorMessage={TimeToErrorMessage}
            tooltip={TimeToTooltip}
            required={TimeToRequired}
            explicitOptional={TimeToExplicitOptional}
            value={timeToControlled}
            customErrorPlace
            onChange={setTimeToControlled}
            disabled={TimeToDisabled}
          />
          {/* Custom render error messages for both fields at small screens */}
          <div className={cx('block flex flex-col lg:hidden lg:w-[320px]')}>
            <FieldErrorMessage errorMessage={TimeToErrorMessage} />
          </div>
        </div>
      </div>

      {/* Custom render error messages for both fields */}
      <div className="flex flex-row gap-4">
        <div className={cx('flex hidden flex-col lg:block lg:w-[320px]')}>
          <FieldErrorMessage errorMessage={TimeFromErrorMessage} />
        </div>
        <div className={cx('hidden h-0.5 bg-white lg:block lg:w-8')} />
        <div className={cx('flex hidden flex-col lg:block lg:w-[320px]')}>
          <FieldErrorMessage errorMessage={TimeToErrorMessage} />
        </div>
      </div>
    </div>
  )
}
