import React, { PropsWithChildren } from 'react'

import FieldFooter, { FieldFooterProps } from '@/src/components/widget-components/FieldFooter'
import FieldHeader, { FieldHeaderProps } from '@/src/components/widget-components/FieldHeader'
import cn from '@/src/frontend/cn'

import { FieldSize } from './FieldBase'

export type FieldWrapperProps = FieldHeaderProps & FieldFooterProps & { size?: FieldSize }

const FieldWrapper = ({
  children,
  size = 'full',
  ...rest
}: PropsWithChildren<FieldWrapperProps>) => {
  return (
    <div
      className={cn('flex w-full flex-col', {
        'max-w-[388px]': size === 'medium',
        'max-w-[200px]': size === 'small',
      })}
    >
      <FieldHeader {...rest} />
      {children}
      <FieldFooter {...rest} />
    </div>
  )
}

export default FieldWrapper
