import cx from 'classnames'
import React, { ReactNode } from 'react'
import { useCheckboxGroup } from 'react-aria'
import { CheckboxGroupState, useCheckboxGroupState } from 'react-stately'

import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import FieldWrapper from '../FieldWrapper'

export const CheckboxGroupContext = React.createContext({} as CheckboxGroupState)

type CheckBoxGroupBase = FieldBaseProps &
  Pick<FieldAdditionalProps, 'className'> & {
    children: ReactNode
    value?: string[]
    onChange: (value: any[]) => void
  }

const CheckboxGroup = (props: CheckBoxGroupBase) => {
  const { children, className, errorMessage, disabled, label, required } = props
  const state: CheckboxGroupState = useCheckboxGroupState(props)
  const { groupProps, labelProps, errorMessageProps } = useCheckboxGroup(props, state)
  return (
    <div {...groupProps}>
      <FieldWrapper
        label={label}
        labelProps={labelProps}
        htmlFor={groupProps.id}
        required={required}
        disabled={disabled}
        errorMessage={errorMessage}
        errorMessageProps={errorMessageProps}
      >
        <div className={cx('flex flex-col gap-3', className)}>
          <CheckboxGroupContext.Provider value={state}>{children}</CheckboxGroupContext.Provider>
        </div>
      </FieldWrapper>
    </div>
  )
}

export default CheckboxGroup
