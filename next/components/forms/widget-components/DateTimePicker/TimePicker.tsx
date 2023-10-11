/* eslint-disable lodash-fp/no-extraneous-args */
import { parseTime } from '@internationalized/date'
import { useControlledState } from '@react-stately/utils'
import { forwardRef, useMemo } from 'react'

import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import TimeField from './TimeField'

function removeSecondsFromTime(time: string): string {
  const parts = time.split(':')
  if (parts.length === 3) {
    return `${parts[0]}:${parts[1]}`
  }
  throw new Error('Invalid time format')
}

export type TimePickerProps = FieldBaseProps &
  Pick<FieldAdditionalProps, 'customErrorPlace'> & {
    value?: string | null
    onChange?: (value?: string | null) => void
    onBlur?: () => void
    minValue?: string
    maxValue?: string
    readOnly?: boolean
  }

// TODO: Picker popup is not working properly, so it is commented out. It's up to discussion if we really need it.
const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      label,
      disabled,
      errorMessage,
      required,
      explicitOptional,
      tooltip,
      helptext,
      onChange = () => {},
      onBlur = () => {},
      value,
      minValue,
      maxValue,
      readOnly,
      customErrorPlace,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ...rest
    },
    ref,
  ) => {
    const [valueControlled, setValueControlled] = useControlledState(value, null, onChange)

    const parsedValue = useMemo(() => {
      if (!valueControlled) return null

      try {
        const time = parseTime(valueControlled)
        return time.set({ second: 0 })
      } catch (error) {
        // Error: Invalid ISO 8601 date string
        console.log('Error: Invalid ISO 8601 date string')
        return null
      }
    }, [valueControlled])

    return (
      <div className="relative w-full max-w-xs">
        <div ref={ref}>
          <TimeField
            // {...fieldProps}
            label={label}
            helptext={helptext}
            required={required}
            explicitOptional={explicitOptional}
            disabled={disabled}
            tooltip={tooltip}
            errorMessage={errorMessage}
            onChange={(time) =>
              setValueControlled(time ? removeSecondsFromTime(time.toString()) : null)
            }
            onBlur={onBlur}
            value={parsedValue}
            readOnly={readOnly}
            customErrorPlace={customErrorPlace}
          />
        </div>
        {/* {state?.isOpen && ( */}
        {/*  <OverlayProvider> */}
        {/*    <Popover */}
        {/*      // {...dialogProps} */}
        {/*      shouldCloseOnBlur={false} */}
        {/*      isOpen={state?.isOpen} */}
        {/*      onClose={closeFailedHandler} */}
        {/*    > */}
        {/*      <TimeSelector */}
        {/*        setHour={setHour} */}
        {/*        hour={hour} */}
        {/*        setMinute={setMinute} */}
        {/*        minute={minute} */}
        {/*        onReset={resetCloseHandler} */}
        {/*        onSubmit={closeSuccessHandler} */}
        {/*        onChange={onChange} */}
        {/*        value={value} */}
        {/*        minValue={minValue} */}
        {/*        maxValue={maxValue} */}
        {/*        setIsInputEdited={setIsInputEdited} */}
        {/*      /> */}
        {/*    </Popover> */}
        {/*  </OverlayProvider> */}
        {/* )} */}
      </div>
    )
  },
)

export default TimePicker
