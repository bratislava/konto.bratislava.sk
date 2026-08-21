/**
 * Builds a markdown link for a phone number or an e-mail address.
 *
 * The displayed label keeps the original formatting, while whitespace is stripped from the href -
 * phone numbers often come with spaces (e.g. '+421 900 000 000') and a markdown link destination
 * must not contain any whitespace, otherwise it is not parsed as a link at all.
 */

export const formatMarkdownLink = ({
  value,
  type,
}: {
  value: string | null | undefined
  type: 'telephone' | 'email'
}) => {
  if (!value) {
    return ''
  }

  const label = value.trim()
  const labelWithoutWhitespace = label.replaceAll(/\s+/g, '')

  return `[${label}](${type === 'telephone' ? 'tel' : 'mailto'}:${labelWithoutWhitespace})`
}
