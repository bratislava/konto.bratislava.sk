import cx from 'classnames'
import { WidgetSpacing, WidgetUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React, { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

import CustomComponents from '../widget-components/CustomComponents/CustomComponents'
import { useWidgetSpacingContext } from './useWidgetSpacingContext'

type WidgetWrapperProps = PropsWithChildren<{
  id: string
  options: WidgetUiOptions
  className?: string
  defaultSpacing?: Partial<WidgetSpacing>
}>

const WidgetWrapper = ({
  id,
  options,
  className,
  children,
  defaultSpacing: {
    spaceTop: spaceTopDefault = 'small',
    spaceBottom: spaceBottomDefault = 'small',
  } = {
    spaceTop: 'small',
    spaceBottom: 'small',
  },
}: WidgetWrapperProps) => {
  const {
    className: optionsClassName,
    spaceBottom: spaceBottomExplicit,
    spaceTop: spaceTopUiExplicit,
    rightComponents,
    belowComponents,
  } = options

  const { spaceTop: spaceTopContext, spaceBottom: spaceBottomContext } = useWidgetSpacingContext()

  const spaceTop = spaceTopUiExplicit ?? spaceTopContext ?? spaceTopDefault
  const spaceBottom = spaceBottomExplicit ?? spaceBottomContext ?? spaceBottomDefault

  const hasRightComponents = rightComponents && rightComponents?.length > 0
  const hasBelowComponents = belowComponents && belowComponents?.length > 0

  return (
    <div
      id={id ?? undefined}
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
