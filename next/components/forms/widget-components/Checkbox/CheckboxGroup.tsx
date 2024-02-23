import cx from 'classnames'
import React, { ReactNode } from 'react'
import { useCheckboxGroup } from 'react-aria'
import { CheckboxGroupState, useCheckboxGroupState } from 'react-stately'

import FieldWrapper, { FieldWrapperProps } from '../FieldWrapper'

export const CheckboxGroupContext = React.createContext({} as CheckboxGroupState)

type CheckboxGroupProps = FieldWrapperProps & {
  className?: string
  children: ReactNode
  value?: string[]
  onChange: (value: string[]) => void
}

const CheckboxGroup = (props: CheckboxGroupProps) => {
  const {
    children,
    className,
    errorMessage,
    disabled,
    label,
    required,
    size,
    labelSize,
    helptext,
    helptextHeader,
    displayOptionalLabel,
  } = props
  const state: CheckboxGroupState = useCheckboxGroupState(props)
  const { groupProps, labelProps, errorMessageProps } = useCheckboxGroup(props, state)
  return (
    <div {...groupProps} data-cy={`checkbox-group-${label.toLowerCase().replace(/ /g, '-').replace(/\?/g, "")}`}>
      <FieldWrapper
        label={label}
        labelProps={labelProps}
        htmlFor={groupProps.id}
        required={required}
        disabled={disabled}
        errorMessage={errorMessage}
        errorMessageProps={errorMessageProps}
        size={size}
        labelSize={labelSize}
        helptext={helptext}
        helptextHeader={helptextHeader}
        customHeaderBottomMargin="mb-4"
        displayOptionalLabel={displayOptionalLabel}
      >
        <div className={cx('flex flex-col gap-3', className)}>
          <CheckboxGroupContext.Provider value={state}>{children}</CheckboxGroupContext.Provider>
        </div>
      </FieldWrapper>
    </div>
  )
}

export default CheckboxGroup
