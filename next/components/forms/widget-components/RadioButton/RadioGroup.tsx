import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Orientation, useRadioGroup } from 'react-aria'
import {
  RadioGroupProps as ReactStatelyRadioGroupProps,
  RadioGroupState,
  useRadioGroupState,
} from 'react-stately'

import ButtonNew from '../../simple-components/ButtonNew'
import FieldWrapper, { FieldWrapperProps } from '../FieldWrapper'

export const RadioContext = React.createContext<RadioGroupState>({} as RadioGroupState)

// TODO it should take RadioGroupProps from react-aria
type RadioGroupProps = FieldWrapperProps & {
  children: ReactNode
  value?: string | null
  defaultValue?: string
  isReadOnly?: boolean
  onChange: (value: string | null) => void
  orientation?: Orientation
  className?: string
}

const RadioGroup = (props: RadioGroupProps) => {
  const { t } = useTranslation('account', { keyPrefix: 'RadioGroup' })

  const {
    children,
    className,
    orientation = 'vertical',
    required,
    label,
    disabled,
    errorMessage,
    helptext,
    helptextHeader,
    tooltip,
    value,
    size,
    labelSize,
    displayOptionalLabel,
  } = props

  const propsReactAria = {
    ...props,
    isDisabled: disabled,
    isRequired: required,
    // it may receive "undefined" as value, which would make it uncontrolled
    value: value == null ? null : value,
  } as ReactStatelyRadioGroupProps

  const state = useRadioGroupState(propsReactAria)
  const { radioGroupProps, labelProps, errorMessageProps } = useRadioGroup(propsReactAria, state)

  const handleReset = () => {
    // setSelectedValue type supports only string, so we need to cast it as null works too
    ;(state.setSelectedValue as (value: string | null) => void)(null)
  }

  return (
    <div {...radioGroupProps} className={className} data-cy={`radio-group-${label.toLowerCase().replace(/ /g, '-').replace(/[(),./?§]/g, "")}`}>
      <FieldWrapper
        label={label}
        labelProps={labelProps}
        htmlFor={radioGroupProps.id}
        helptext={helptext}
        helptextHeader={helptextHeader}
        tooltip={tooltip}
        required={required}
        disabled={disabled}
        errorMessage={errorMessage}
        errorMessageProps={errorMessageProps}
        size={size}
        labelSize={labelSize}
        customHeaderBottomMargin="mb-4"
        displayOptionalLabel={displayOptionalLabel}
      >
        <RadioContext.Provider value={state}>
          <div className="flex flex-col gap-2">
            <div
              className={cx({
                'flex flex-col gap-3': orientation === 'vertical',
                // Acts as vertical on xs
                'flex flex-col gap-3 sm:flex-row sm:gap-4 md:gap-6': orientation === 'horizontal',
              })}
            >
              {children}
            </div>

            {!required ? (
              <ButtonNew
                variant="black-plain"
                size="small"
                className="self-end font-medium"
                onPress={handleReset}
              >
                {t('resetChoice')}
              </ButtonNew>
            ) : null}
          </div>
        </RadioContext.Provider>
      </FieldWrapper>
    </div>
  )
}

export default RadioGroup
