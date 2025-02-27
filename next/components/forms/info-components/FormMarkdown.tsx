import React, { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import remarkSupersub from 'remark-supersub'

import MLinkNew from '../simple-components/MLinkNew'
import FormLightboxModal from './FormLightboxModal'

function getTaxYear() {
  const today = new Date()
  const currentYear = today.getFullYear()
  const februaryFirst = new Date(currentYear, 1, 1)

  return today < februaryFirst ? currentYear - 1 : currentYear
}

export type FormMarkdownProps = {
  children: string
  /**
   * By default, the text in markdown is wrapped in a paragraph. In some cases we don't want to create a new paragraph.
   */
  pAsSpan?: boolean
}

/**
 * Renders custom text in form (helptexts, etc.). Allows to use only specific set of Markdown tags. Also implements a
 * special directives such as `form-image-preview`.
 */
const FormMarkdown = ({ children, pAsSpan }: FormMarkdownProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkSupersub, remarkDirective, remarkDirectiveRehype]}
      rehypePlugins={[
        [
          rehypeSanitize,
          {
            tagNames: [
              'strong',
              'em',
              'sub',
              'sup',
              'p',
              'a',
              'ul',
              'ol',
              'li',
              'form-image-preview',
              'tax-year',
              'tax-year-next',
            ],
            attributes: {
              'form-image-preview': ['src'],
              a: ['href'],
            },
          },
        ],
      ]}
      components={{
        'form-image-preview': ({ children: childrenInner, node }) => {
          return (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            <FormLightboxModal imageUrl={node?.properties?.src ?? ''}>
              {childrenInner}
            </FormLightboxModal>
          )
        },
        a: ({ href, children: childrenInner }) => (
          <MLinkNew
            href={href ?? '#'}
            target={href?.startsWith('http') ? '_blank' : ''}
            variant="underlined"
          >
            {childrenInner as ReactNode}
          </MLinkNew>
        ),
        ul: ({ children: childrenInner }) => (
          <ul className="list-disc whitespace-normal pl-8">{childrenInner as ReactNode}</ul>
        ),
        ol: ({ children: childrenInner }) => (
          <ol className="list-decimal  whitespace-normal pl-8">{childrenInner as ReactNode}</ol>
        ),
        'tax-year': () => <>{getTaxYear()}</>,
        'tax-year-next': () => <>{getTaxYear() + 1}</>,
        ...(pAsSpan
          ? {
              p: ({ children: childrenInner }) => <span>{childrenInner as ReactNode}</span>,
            }
          : {}),
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export default FormMarkdown
