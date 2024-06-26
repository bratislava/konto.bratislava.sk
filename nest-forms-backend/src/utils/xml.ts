export default function escapeXml(unsafe: string): string {
  return unsafe.replaceAll(/["&'<>]/g, (match) => {
    switch (match) {
      case '<':
        return '&lt;'

      case '>':
        return '&gt;'

      case '&':
        return '&amp;'

      case "'":
        return '&apos;'

      case '"':
        return '&quot;'

      default:
        return match
    }
  })
}
