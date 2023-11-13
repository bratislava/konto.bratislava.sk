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

type FormMarkdownProps = { children: string }

/**
 * Renders custom text in form (helptexts, etc.). Allows to use only specific set of Markdown tags. Also implements a
 * special directives such as `form-image-preview`.
 */
const FormMarkdown = ({ children }: FormMarkdownProps) => {
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
              tagNames: ['strong', 'em', 'sub', 'sup', 'p', 'a', 'form-image-preview'],
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
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
              target={href?.startsWith('http') ? '_blank' : ''}
              variant="underlined"
            >
              {childrenInner}
            </MLinkNew>
          ),
        }}
      >
        {withoutPrefix}
      </ReactMarkdown>
    )
  }

  return <>{children}</>
}

export default FormMarkdown
