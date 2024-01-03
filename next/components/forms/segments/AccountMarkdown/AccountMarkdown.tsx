import cx from 'classnames'
import Link from 'next/link'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { PluggableList } from 'react-markdown/lib'
import rehypeRaw from 'rehype-raw'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import remarkGfm from 'remark-gfm'

// eslint-disable-next-line import/no-cycle
import BATooltip from '../../info-components/Tooltip/BATooltip'

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
  const remarkPlugins: PluggableList = []
  if (!disableRemarkGfm) {
    remarkPlugins.push(remarkGfm)
  }
  if (!disableRemarkDirective) {
    remarkPlugins.push(remarkDirective)
  }
  if (!disableRemarkDirectiveRehype) {
    remarkPlugins.push(remarkDirectiveRehype)
  }

  const componentsGroup: Record<string, React.FC<ChildrenParent>> = {
    h2: ({ children }: ChildrenParent) => <h2 className="text-h2">{children}</h2>,
    h3: ({ children }: ChildrenParent) => <h3 className="text-h3">{children}</h3>,
    h4: ({ children }: ChildrenParent) => <h4 className="text-h4">{children}</h4>,
    h5: ({ children }: ChildrenParent) => <h5 className="text-h5">{children}</h5>,
    h6: ({ children }: ChildrenParent) => <h6 className="text-h6">{children}</h6>,
    p: ({ children }: ChildrenParent) => (
      <p
        className={
          variant === 'sm' ? 'text-p3 lg:text-p2' : variant === 'statusBar' ? 'text-p2' : 'text-p1'
        }
      >
        {children}
      </p>
    ),
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
      <li className="text-p1" {...props}>
        {children}
      </li>
    ),
    a: ({ href, children }: ChildrenParent) => (
      <Link
        href={href ?? '#'}
        className={cx('break-words font-semibold underline underline-offset-4', {
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
    <ReactMarkdown
      className={cx('flex flex-col gap-3', className)}
      remarkPlugins={remarkPlugins}
      rehypePlugins={[rehypeRaw, remarkDirective, remarkDirectiveRehype]}
      components={componentsGroup}
    >
      {content ?? ''}
    </ReactMarkdown>
  )
}

export default AccountMarkdown
