/* eslint-disable lodash-fp/no-extraneous-args */
import { ClockIcon } from '@assets/ui-icons'
import cx from 'classnames'
import padStart from 'lodash/padStart'
import { forwardRef, ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import { OverlayProvider, useButton, useDatePicker } from 'react-aria'
import { useDatePickerState } from 'react-stately'
import { useEffectOnce } from 'usehooks-ts'

import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import Popover from './Popover'
import TimeField from './TimeField'
import TimeSelector from './TimeSelector'

type ButtonBase = {
  children?: ReactNode
  disabled?: boolean
  onClick?: () => void
}

const Button = ({ children, disabled, ...rest }: ButtonBase) => {
  const ref = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton({ isDisabled: disabled, ...rest }, ref)
  return (
    <button
      className={cx('focus:outline-none', { 'opacity-50': disabled })}
      type="button"
      {...buttonProps}
      ref={ref}
    >
      {children}
    </button>
  )
}

export const convertTimeToValidFormat = (timeValue: string) => {
  const [hours, minutes] = timeValue ? timeValue.split(':') : ['00', '00']
  return `${hours ? padStart(hours, 2, '0') : ''}${hours || minutes ? ':' : ''}${
    minutes ? padStart(minutes, 2, '0') : ''
  }`
}

export type TimePickerProps = FieldBaseProps &
  Pick<FieldAdditionalProps, 'customErrorPlace'> & {
    value?: string
    minValue?: string
    maxValue?: string
    readOnly?: boolean
    onChange?: (value?: string) => void
  }

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
      value = '',
      minValue,
      maxValue,
      readOnly = false,
      customErrorPlace = false,
      ...rest
    },
    ref,
  ) => {
    const [hour, setHour] = useState<string>('')
    const [minute, setMinute] = useState<string>('')

    const [isInputEdited, setIsInputEdited] = useState<boolean>(false)

    const [prevValue, setPrevValue] = useState<string>('')

    const state = useDatePickerState({
      label,
      errorMessage,
      isRequired: required,
      isDisabled: disabled,
      shouldCloseOnSelect: false,
      ...rest,
    })
    const { fieldProps, buttonProps, dialogProps } = useDatePicker(
      { errorMessage, isDisabled: disabled, label, ...rest },
      state,
      ref as RefObject<HTMLDivElement>,
    )

    const resetValues = () => {
      if (onChange) onChange('')
      setMinute('')
      setHour('')
      setPrevValue('')
    }

    const addZeroOnSuccess = (): void => {
      if (!hour || !minute) {
        if (hour) {
          if (onChange) onChange(`${padStart(hour, 2, '0')}:00`)
          setMinute('00')
          setPrevValue(`${padStart(hour, 2, '0')}:00`)
        }
        if (minute) {
          if (onChange) onChange(`00:${padStart(minute, 2, '0')}`)
          setHour('00')
          setPrevValue(`00:${padStart(minute, 2, '0')}`)
        }
      }
    }

    const closeFailedHandler = () => {
      if (onChange && prevValue) onChange(prevValue)
      else if (onChange) onChange()

      if (prevValue) setHour(prevValue.split(':')[0])
      else setHour('')

      if (prevValue) setMinute(prevValue.split(':')[1])
      else setMinute('')

      state?.close()
    }

    const closeSuccessHandler = () => {
      if (onChange && value) setPrevValue((prev) => (prev !== value ? value : prev))
      addZeroOnSuccess()
      state?.close()
    }

    const resetCloseHandler = () => {
      resetValues()
      state?.close()
    }

    useEffect(() => {
      if (isInputEdited) {
        setMinute('')
        setHour('')
        setPrevValue('')
      }
    }, [isInputEdited])

    useEffectOnce(() => {
      const convertedTimeToValidFormat = convertTimeToValidFormat(value)
      if (value) setPrevValue(convertedTimeToValidFormat)
      if (onChange) onChange(convertedTimeToValidFormat)
    })

    return (
      <div className="relative w-full max-w-xs">
        <div ref={ref}>
          <TimeField
            {...fieldProps}
            label={label}
            helptext={helptext}
            required={required}
            explicitOptional={explicitOptional}
            disabled={disabled}
            tooltip={tooltip}
            errorMessage={errorMessage}
            hour={hour}
            minute={minute}
            isOpen={state?.isOpen}
            onChange={onChange}
            value={value}
            readOnly={readOnly}
            setIsInputEdited={setIsInputEdited}
            setPrevValue={setPrevValue}
            customErrorPlace={customErrorPlace}
          >
            <Button {...buttonProps} disabled={disabled}>
              <ClockIcon className="h-5 w-5 lg:h-6 lg:w-6" />
            </Button>
          </TimeField>
        </div>
        {state?.isOpen && (
          <OverlayProvider>
            <Popover
              {...dialogProps}
              shouldCloseOnBlur={false}
              isOpen={state?.isOpen}
              onClose={closeFailedHandler}
            >
              <TimeSelector
                setHour={setHour}
                hour={hour}
                setMinute={setMinute}
                minute={minute}
                onReset={resetCloseHandler}
                onSubmit={closeSuccessHandler}
                onChange={onChange}
                value={value}
                minValue={minValue}
                maxValue={maxValue}
                setIsInputEdited={setIsInputEdited}
              />
            </Popover>
          </OverlayProvider>
        )}
      </div>
    )
  },
)

export default TimePicker
