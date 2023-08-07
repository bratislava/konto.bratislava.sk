/* eslint-disable lodash-fp/no-extraneous-args */
import { parseTime } from '@internationalized/date'
import padStart from 'lodash/padStart'
import { forwardRef, useMemo } from 'react'

import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import TimeField from './TimeField'

export const convertTimeToValidFormat = (timeValue: string) => {
  const [hours, minutes] = timeValue ? timeValue.split(':') : ['00', '00']
  return `${hours ? padStart(hours, 2, '0') : ''}${hours || minutes ? ':' : ''}${
    minutes ? padStart(minutes, 2, '0') : ''
  }`
}

export type TimePickerProps = FieldBaseProps &
  Pick<FieldAdditionalProps, 'customErrorPlace'> & {
    value?: string
    onChange?: (value?: string) => void
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
      onChange,
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
    // const [hour, setHour] = useState<string>('')
    // const [minute, setMinute] = useState<string>('')

    // const [isInputEdited, setIsInputEdited] = useState<boolean>(false)

    // const [prevValue, setPrevValue] = useState<string>('')

    // const state = useDatePickerState({
    //   label,
    //   errorMessage,
    //   isRequired: required,
    //   isDisabled: disabled,
    //   shouldCloseOnSelect: false,
    //   ...rest,
    // })

    const parsedTimeValue = useMemo(() => {
      if (!value) return null

      try {
        return parseTime(value)
      } catch (error) {
        // Error: Invalid ISO 8601 date string
        console.log('Error: Invalid ISO 8601 date string')
        return null
      }
    }, [value])

    // const { fieldProps, buttonProps, dialogProps } = useDatePicker(
    //   { errorMessage, isDisabled: disabled, label, value: null, ...rest },
    //   state,
    // eslint-disable-next-line no-secrets/no-secrets
    //   ref as RefObject<HTMLDivElement>,
    // )

    // const buttonPropsFixed = {
    //   ...buttonProps,
    //   href: undefined,
    //   target: undefined,
    //   children: undefined,
    // }

    // const resetValues = () => {
    //   if (onChange) onChange('')
    //   setMinute('')
    //   setHour('')
    //   setPrevValue('')
    // }

    // const closeFailedHandler = () => {
    //   if (onChange && prevValue) onChange(prevValue)
    //   else if (onChange) onChange()
    //
    //   if (prevValue) setHour(prevValue.split(':')[0])
    //   else setHour('')
    //
    //   if (prevValue) setMinute(prevValue.split(':')[1])
    //   else setMinute('')
    //
    //   state?.close()
    // }

    // const closeSuccessHandler = () => {
    //   if (onChange && value) setPrevValue((prev) => (prev !== value ? value : prev))
    //   state?.close()
    // }

    // const resetCloseHandler = () => {
    //   resetValues()
    //   state?.close()
    // }

    // useEffect(() => {
    //   if (isInputEdited) {
    //     setMinute('')
    //     setHour('')
    //     setPrevValue('')
    //   }
    // }, [isInputEdited])

    // useEffectOnce(() => {
    //   const convertedTimeToValidFormat = convertTimeToValidFormat(value ?? '')
    //   if (value) setPrevValue(convertedTimeToValidFormat)
    //   if (onChange) onChange(convertedTimeToValidFormat)
    // })

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
            onChange={() => (onChange ? onChange(value?.toString()) : undefined)}
            value={parsedTimeValue ?? undefined}
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
