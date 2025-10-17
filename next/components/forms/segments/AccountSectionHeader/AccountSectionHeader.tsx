import cn from 'frontend/cn'
import { PropsWithChildren } from 'react'

type AccountSectionHeaderBase = PropsWithChildren<{
  title: string
  text?: string
  /** This is used when page contains other h1, such as homepage */
  titleAsParagraph?: boolean
  /** Temporary added before better solution is implemented */
  titleWrapperClassName?: string
  /** Temporary added before better solution is implemented */
  wrapperClassName?: string
}>

const AccountSectionHeader = (props: AccountSectionHeaderBase) => {
  const { title, text, titleAsParagraph, titleWrapperClassName, wrapperClassName, children } = props
  return (
    <div className="bg-gray-50">
      <div
        className={cn(
          'm-auto flex max-w-(--breakpoint-lg) flex-col gap-4 lg:gap-6',
          wrapperClassName,
        )}
      >
        <span
          className={cn('size-full justify-end py-6 pl-4 lg:px-0 lg:py-16', titleWrapperClassName)}
        >
          {titleAsParagraph ? (
            <p className="text-h1">{title}</p>
          ) : (
            <h1 className="text-h1">{title}</h1>
          )}
          {text && <p className="mt-3 text-p1">{text}</p>}
        </span>
        {children}
      </div>
    </div>
  )
}

export default AccountSectionHeader
