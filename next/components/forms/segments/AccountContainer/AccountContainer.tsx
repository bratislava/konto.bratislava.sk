import cx from 'classnames'

export const AccountContainer = ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'mx-auto w-full max-w-[696px] bg-gray-0 px-4 py-6 md:rounded-lg md:px-12 md:py-8 md:shadow',
      className,
    )}
  >
    {children}
  </div>
)

export default AccountContainer
