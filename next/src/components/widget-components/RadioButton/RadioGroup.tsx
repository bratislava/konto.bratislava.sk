import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Orientation, useRadioGroup } from 'react-aria'
import {
  RadioGroupProps as ReactStatelyRadioGroupProps,
  RadioGroupState,
  useRadioGroupState,
} from 'react-stately'

import FieldWrapper, { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'
import cn from '@/src/utils/cn'

export const RadioContext = React.createContext<RadioGroupState>({} as RadioGroupState)

// TODO it should take RadioGroupProps from react-aria
type RadioGroupProps = FieldWrapperProps & {
  children: ReactNode
  value?: string | null
  defaultValue?: string
  onChange: (value: string | null) => void
  orientation?: Orientation
  className?: string
}

const RadioGroup = (props: RadioGroupProps) => {
  const { t } = useTranslation('account')

  const { children, value, orientation = 'vertical', className, ...rest } = props

  const propsReactAria = {
    ...props,
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
    <div
      {...radioGroupProps}
      className={className}
      data-cy={`radio-group-${rest.label
        .toLowerCase()
        .replaceAll(' ', '-')
        .replaceAll(/[(),./?§]/g, '')}`}
    >
      <FieldWrapper
        {...rest}
        labelProps={labelProps}
        htmlFor={radioGroupProps.id}
        errorMessageProps={errorMessageProps}
        customHeaderBottomMargin="mb-4"
      >
        <RadioContext.Provider value={state}>
          <div className="flex flex-col gap-2">
            <div
              className={cn({
                'flex flex-col gap-3': orientation === 'vertical',
                // Acts as vertical on xs
                'flex flex-col gap-3 sm:flex-row sm:gap-4 md:gap-6': orientation === 'horizontal',
              })}
            >
              {children}
            </div>

            {rest.isRequired ? null : (
              <Button
                variant="plain"
                size="small"
                className="self-end font-medium"
                onPress={handleReset}
              >
                {t('RadioGroup.resetChoice')}
              </Button>
            )}
          </div>
        </RadioContext.Provider>
      </FieldWrapper>
    </div>
  )
}

export default RadioGroup
