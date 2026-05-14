import { Typography } from '@bratislava/component-library'
import Link from 'next/link'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import remarkGfm from 'remark-gfm'

import BATooltip from '@/src/components/simple-components/Tooltip/BATooltip'
import { isDefined } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'

type AccountMarkdownBase = {
  className?: string
  content?: string
  variant?: 'sm' | 'normal' | 'statusBar'
  uLinkVariant?: 'primary' | 'default' | 'error'
  disableRemarkGfm?: boolean
  disableRemarkDirective?: boolean
  disableRemarkDirectiveRehype?: boolean
}

interface ChildrenParent {
  children?: React.ReactNode | string
  href?: string
  [key: string]: unknown
}

const AccountMarkdown = ({
  className,
  content,
  disableRemarkGfm,
  disableRemarkDirective,
  disableRemarkDirectiveRehype,
  variant = 'normal',
  uLinkVariant = 'default',
}: AccountMarkdownBase) => {
  const remarkPlugins = [
    disableRemarkGfm ? null : remarkGfm,
    disableRemarkDirective ? null : remarkDirective,
    disableRemarkDirectiveRehype ? null : remarkDirectiveRehype,
  ].filter(isDefined)

  const textStyle = cn('whitespace-pre-line', {
    'text-size-p-tiny-r lg:text-size-p-small': variant === 'sm',
    'text-size-p-small-r lg:text-size-p-small': variant === 'statusBar',
    'text-size-p-small-r lg:text-size-p-large': variant === 'normal',
  })

  const componentsGroup: Record<string, React.FC<ChildrenParent>> = {
    h2: ({ children }: ChildrenParent) => <Typography variant="h2">{children}</Typography>,
    h3: ({ children }: ChildrenParent) => <Typography variant="h3">{children}</Typography>,
    h4: ({ children }: ChildrenParent) => <Typography variant="h4">{children}</Typography>,
    h5: ({ children }: ChildrenParent) => <Typography variant="h5">{children}</Typography>,
    h6: ({ children }: ChildrenParent) => <Typography variant="h6">{children}</Typography>,
    p: ({ children }: ChildrenParent) => <Typography className={textStyle}>{children}</Typography>,
    strong: ({ children }: ChildrenParent) => <strong className="font-semibold">{children}</strong>,
    ol: ({ children, ordered, ...props }: ChildrenParent) => (
      <ol className="list-decimal pl-8" {...props}>
        {children}
      </ol>
    ),
    ul: ({ children, ordered, ...props }: ChildrenParent) => (
      <ul className="list-disc pl-8" {...props}>
        {children}
      </ul>
    ),
    li: ({ children, ordered, ...props }: ChildrenParent) => (
      <li className={textStyle} {...props}>
        {children}
      </li>
    ),
    a: ({ href, children }: ChildrenParent) => (
      <Link
        href={href ?? '#'}
        className={cn('font-semibold wrap-break-word underline underline-offset-4', {
          'text-white hover:text-category-600': uLinkVariant === 'primary',
          'text-font hover:text-category-600': uLinkVariant === 'default',
          'text-white hover:text-white': uLinkVariant === 'error',
        })}
        target={href?.startsWith('http') ? '_blank' : ''}
      >
        {children}
      </Link>
    ),
    tooltip: ({ children }: ChildrenParent) =>
      children && typeof children === 'string' ? (
        <BATooltip placement="top right">{children}</BATooltip>
      ) : null,
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={[rehypeRaw, remarkDirective, remarkDirectiveRehype]}
        components={componentsGroup}
      >
        {content ?? ''}
      </ReactMarkdown>
    </div>
  )
}

export default AccountMarkdown
