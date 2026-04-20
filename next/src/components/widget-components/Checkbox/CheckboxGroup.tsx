import React, { ReactNode } from 'react'
import { useCheckboxGroup } from 'react-aria'
import { CheckboxGroupState, useCheckboxGroupState } from 'react-stately'

import FieldWrapper, { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'
import cn from '@/src/utils/cn'

export const CheckboxGroupContext = React.createContext({} as CheckboxGroupState)

type CheckboxGroupProps = FieldWrapperProps & {
  className?: string
  children: ReactNode
  value?: string[]
  onChange: (value: string[]) => void
}

const CheckboxGroup = (props: CheckboxGroupProps) => {
  const { children, className, ...rest } = props
  const state = useCheckboxGroupState(props)
  const { groupProps, labelProps, errorMessageProps } = useCheckboxGroup(props, state)

  return (
    <div
      {...groupProps}
      data-cy={`checkbox-group-${rest.label.toLowerCase().replaceAll(' ', '-').replaceAll('?', '')}`}
    >
      <FieldWrapper
        {...rest}
        labelProps={labelProps}
        htmlFor={groupProps.id}
        errorMessageProps={errorMessageProps}
        customHeaderBottomMargin="mb-4"
      >
        <div className={cn('flex flex-col gap-3', className)}>
          <CheckboxGroupContext.Provider value={state}>{children}</CheckboxGroupContext.Provider>
        </div>
      </FieldWrapper>
    </div>
  )
}

export default CheckboxGroup
