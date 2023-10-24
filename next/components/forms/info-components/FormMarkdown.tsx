import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import remarkSupersub from 'remark-supersub'
import { markdownTextPrefix } from 'schema-generator/generator/uiOptionsTypes'

import ButtonNew from '../simple-components/ButtonNew'

type FormMarkdownProps = { children: string }

/**
 * Renders custom text in form (helptexts, etc.). Allows to use only specific set of Markdown tags. Also implements a
 * special directives such as `tax-image-preview`.
 */
const FormMarkdown = ({ children }: FormMarkdownProps) => {
  if (children.startsWith(markdownTextPrefix)) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const withoutPrefix = children.replace(new RegExp(`^${markdownTextPrefix}`), '')

    return (
      <ReactMarkdown
        remarkPlugins={[remarkSupersub, remarkDirective, remarkDirectiveRehype]}
        rehypePlugins={[
          [rehypeSanitize, { tagNames: ['strong', 'em', 'sub', 'sup', 'p', 'tax-image-preview'] }],
        ]}
        components={{
          // @ts-expect-error https://github.com/remarkjs/react-markdown/issues/622
          'tax-image-preview': ({ children: childrenInner }) => (
            // TODO Implement lightboxes
            <ButtonNew onPress={() => {}} variant="black-link">
              {childrenInner}
            </ButtonNew>
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
