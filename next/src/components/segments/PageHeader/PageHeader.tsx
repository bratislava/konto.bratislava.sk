import { Typography } from '@bratislava/component-library'
import { PropsWithChildren } from 'react'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import cn from '@/src/utils/cn'

type AccountSectionHeaderBase = PropsWithChildren<{
  title: string
  text?: string
  className?: string
  /** This is used when page contains other h1, such as homepage */
  titleAsParagraph?: boolean
  /** Temporary added before better solution is implemented */
  titleWrapperClassName?: string
}>

const PageHeader = (props: AccountSectionHeaderBase) => {
  const { title, text, className, titleAsParagraph, titleWrapperClassName, children } = props

  return (
    <SectionContainer className={cn('bg-gray-50', className)}>
      <div className="flex flex-col gap-4 lg:gap-6">
        <span className={cn('size-full justify-end py-6 lg:px-0 lg:py-16', titleWrapperClassName)}>
          {titleAsParagraph ? (
            <Typography variant="h1" as="p">{title}</Typography>
          ) : (
            <Typography variant="h1">{title}</Typography>
          )}
          {text && <p className="text-p1 mt-3">{text}</p>}
        </span>
        {children}
      </div>
    </SectionContainer>
  )
}

export default PageHeader
