import { createElement } from 'react'

/**
 * HTML that React can't render, such as Outlook conditional comments (`<!--[if mso]>…`). It renders
 * as a placeholder element; `insertRawHtml` replaces it with the HTML after rendering. Unlike a
 * `dangerouslySetInnerHTML` wrapper, nothing is left around it, so an opening and a closing comment
 * can wrap other elements (an Outlook-only table, for example).
 */
export const RawHtml = ({ html }: { html: string }) =>
  createElement(rawHtmlTag, { 'data-html': html })

const rawHtmlTag = 'ba-raw-html'

// React escapes these five characters in attribute values.
const attributeEntities: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
}

export const insertRawHtml = (html: string) =>
  html.replace(
    new RegExp(`<${rawHtmlTag} data-html="([^"]*)"></${rawHtmlTag}>`, 'g'),
    (_, escaped: string) =>
      escaped.replace(
        /&amp;|&lt;|&gt;|&quot;|&#x27;/g,
        (entity) => attributeEntities[entity] ?? entity,
      ),
  )
