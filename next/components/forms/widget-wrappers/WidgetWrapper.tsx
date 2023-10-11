import cx from 'classnames'
import React, { PropsWithChildren } from 'react'
import { FormSpacingType, WidgetUiOptions } from 'schema-generator/generator/uiOptionsTypes'
import { twMerge } from 'tailwind-merge'

import CustomComponents from '../widget-components/CustomComponents/CustomComponents'

export const isFormSpacingType = (formSpacingType: string): formSpacingType is FormSpacingType => {
  return ['large', 'default', 'small', 'medium', 'none'].includes(formSpacingType)
}

type WidgetWrapperProps = PropsWithChildren<{ options: WidgetUiOptions; className?: string }>

const WidgetWrapper = ({ options, className, children }: WidgetWrapperProps) => {
  const {
    className: optionsClassName,
    spaceBottom = 'none',
    spaceTop = 'large',
    rightComponents,
    belowComponents,
  } = options

  const hasRightComponents = rightComponents && rightComponents?.length > 0
  const hasBelowComponents = belowComponents && belowComponents?.length > 0

  return (
    <div
      className={twMerge(
        'flex flex-col gap-4',
        className,
        optionsClassName,
        cx({
          'mb-0': spaceBottom === 'none',
          'mb-10': spaceBottom === 'large',
          'mb-8': spaceBottom === 'medium',
          'mb-6': spaceBottom === 'small',
          'mb-4': spaceBottom === 'default',

          'mt-0': spaceTop === 'none',
          'mt-10': spaceTop === 'large',
          'mt-8': spaceTop === 'medium',
          'mt-6': spaceTop === 'small',
          'mt-4': spaceTop === 'default',
        }),
      )}
    >
      {hasRightComponents ? (
        <div className="sm:grid sm:grid-cols-2 sm:gap-4">
          <div>{children}</div>
          <div>
            <CustomComponents components={rightComponents} />
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
      {hasBelowComponents && <CustomComponents components={belowComponents} />}
    </div>
  )
}

export default WidgetWrapper
