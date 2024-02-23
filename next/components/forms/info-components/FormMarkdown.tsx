import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { Schema } from 'rehype-sanitize/lib'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import remarkSupersub from 'remark-supersub'
import { markdownTextPrefix } from 'schema-generator/generator/uiOptionsTypes'

import MLinkNew from '../simple-components/MLinkNew'
import FormLightboxModal from './FormLightboxModal'

function getTaxYear() {
  const today = new Date()
  const currentYear = today.getFullYear()
  const februaryFirst = new Date(currentYear, 1, 1)

  return today < februaryFirst ? currentYear - 1 : currentYear
}

type FormMarkdownProps = {
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
  if (children.startsWith(markdownTextPrefix)) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const withoutPrefix = children.replace(new RegExp(`^${markdownTextPrefix}`), '')

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
            } as Schema,
          ],
        ]}
        components={{
          // @ts-expect-error https://github.com/remarkjs/react-markdown/issues/622
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
              {childrenInner}
            </MLinkNew>
          ),
          ul: ({ children: childrenInner }) => (
            <ul className="list-disc whitespace-normal pl-8">{childrenInner}</ul>
          ),
          ol: ({ children: childrenInner }) => (
            <ol className="list-decimal  whitespace-normal pl-8">{childrenInner}</ol>
          ),
          'tax-year': () => <>{getTaxYear()}</>,
          'tax-year-next': () => <>{getTaxYear() + 1}</>,
          ...(pAsSpan
            ? {
                p: ({ children: childrenInner }) => <span>{childrenInner}</span>,
              }
            : {}),
        }}
      >
        {withoutPrefix}
      </ReactMarkdown>
    )
  }

  return <>{children}</>
}

export default FormMarkdown
