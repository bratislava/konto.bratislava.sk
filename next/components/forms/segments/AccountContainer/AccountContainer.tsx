import cx from 'classnames'
import React, { forwardRef, PropsWithChildren } from 'react'

type AccountContainerProps = {
  className?: string
  dataCyPrefix?: string
}

export const AccountContainer = forwardRef<
  HTMLDivElement,
  PropsWithChildren<AccountContainerProps>
>(({ children, className, dataCyPrefix }, ref) => (
  <div
    ref={ref}
    data-cy={dataCyPrefix ? `${dataCyPrefix}-container` : null}
    className={cx(
      'bg-gray-0 md:shadow-default mx-auto w-full max-w-[696px] px-4 py-6 md:rounded-lg md:px-12 md:py-8',
      className,
    )}
  >
    {children}
  </div>
))

export default AccountContainer
