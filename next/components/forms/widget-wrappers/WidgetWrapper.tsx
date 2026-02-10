import { WidgetUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React, { PropsWithChildren } from 'react'

import CustomComponents from '@/components/forms/widget-components/CustomComponents/CustomComponents'
import cn from '@/frontend/cn'

type WidgetWrapperProps = PropsWithChildren<{
  id: string
  options: WidgetUiOptions
  className?: string
}>

const WidgetWrapper = ({ id, options, className, children }: WidgetWrapperProps) => {
  const { className: optionsClassName, rightComponents, belowComponents } = options

  const hasRightComponents = rightComponents && rightComponents?.length > 0
  const hasBelowComponents = belowComponents && belowComponents?.length > 0

  return (
    <div id={id ?? undefined} className={cn('flex flex-col gap-4', className, optionsClassName)}>
      {hasRightComponents ? (
        <div className="sm:grid sm:grid-cols-2 sm:gap-4">
          <div>{children}</div>
          <div>
            <CustomComponents id={id} components={rightComponents} />
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
      {hasBelowComponents && <CustomComponents id={id} components={belowComponents} />}
    </div>
  )
}

export default WidgetWrapper
