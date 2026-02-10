import React, { ComponentType, type ReactElement, ReactNode } from 'react'
import _ReactMarkdown, { ExtraProps, Options } from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import remarkSupersub from 'remark-supersub'

import MLink from '@/components/forms/simple-components/MLink'

import FormLightboxModal from './FormLightboxModal'

function getTaxYear() {
  const today = new Date()
  const currentYear = today.getFullYear()
  const februaryFirst = new Date(currentYear, 1, 1)

  return today < februaryFirst ? currentYear - 1 : currentYear
}

type GenericReactMarkdownComponent = ComponentType<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & ExtraProps
>

const ReactMarkdown = _ReactMarkdown as (
  options: Readonly<
    Options & {
      components: {
        'form-image-preview': GenericReactMarkdownComponent
        'tax-year': GenericReactMarkdownComponent
        'tax-year-next': GenericReactMarkdownComponent
      }
    }
  >,
) => ReactElement

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
            <FormLightboxModal
              imageUrl={(node?.properties?.src as string | null | undefined) ?? ''}
            >
              {childrenInner}
            </FormLightboxModal>
          )
        },
        a: ({ href, children: childrenInner }) => (
          <MLink
            href={href ?? '#'}
            target={href?.startsWith('http') ? '_blank' : ''}
            variant="underlined"
          >
            {childrenInner as ReactNode}
          </MLink>
        ),
        ul: ({ children: childrenInner }) => (
          <ul className="list-disc pl-8 whitespace-normal">{childrenInner as ReactNode}</ul>
        ),
        ol: ({ children: childrenInner }) => (
          <ol className="list-decimal pl-8 whitespace-normal">{childrenInner as ReactNode}</ol>
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
