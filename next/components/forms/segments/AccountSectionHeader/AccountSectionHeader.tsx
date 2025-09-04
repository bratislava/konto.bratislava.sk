import cn from 'frontend/cn'
import { PropsWithChildren } from 'react'

type AccountSectionHeaderBase = PropsWithChildren<{
  title: string
  text?: string
  /** This is used when page contains other h1, such as homepage */
  titleAsParagraph?: boolean
  wrapperClassName?: string
}>

const AccountSectionHeader = (props: AccountSectionHeaderBase) => {
  const { title, text, titleAsParagraph, wrapperClassName, children } = props
  return (
    <div className="gap-6 bg-gray-50">
      <div className="m-auto flex max-w-(--breakpoint-lg) flex-col gap-6">
        <span className={cn('size-full justify-end py-6 pl-4 lg:px-0 lg:py-16', wrapperClassName)}>
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
