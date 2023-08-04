import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Orientation, useRadioGroup } from 'react-aria'
import { RadioGroupProps, RadioGroupState, useRadioGroupState } from 'react-stately'

import ButtonNew from '../../simple-components/ButtonNew'
import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import FieldWrapper from '../FieldWrapper'

export const RadioContext = React.createContext<RadioGroupState>({} as RadioGroupState)

// TODO it should take RadioGroupProps from react-aria
type RadioGroupBase = Omit<FieldBaseProps, 'explicitOptional'> &
  Pick<FieldAdditionalProps, 'className'> & {
    children: ReactNode
    value?: string
    defaultValue?: string
    isReadOnly?: boolean
    onChange: (value: string) => void
    orientation?: Orientation
  }

const RadioGroup = (props: RadioGroupBase) => {
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
    tooltip,
  } = props

  const propsReactAria = {
    ...props,
    isDisabled: disabled,
    isRequired: required,
  } as RadioGroupProps

  const state = useRadioGroupState(propsReactAria)
  const { radioGroupProps, labelProps, errorMessageProps } = useRadioGroup(propsReactAria, state)

  const handleReset = () => {
    // TODO, this may need to be changed to null or undefined
    state.setSelectedValue('')
  }

  return (
    <div {...radioGroupProps} className={className}>
      <FieldWrapper
        label={label}
        labelProps={labelProps}
        htmlFor={radioGroupProps.id}
        helptext={helptext}
        tooltip={tooltip}
        required={required}
        disabled={disabled}
        errorMessage={errorMessage}
        errorMessageProps={errorMessageProps}
      >
        <RadioContext.Provider value={state}>
          <div className="flex flex-col gap-2">
            <div
              className={cx({
                'flex flex-col gap-3': orientation === 'vertical',
                'flex flex-row gap-6': orientation === 'horizontal',
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
