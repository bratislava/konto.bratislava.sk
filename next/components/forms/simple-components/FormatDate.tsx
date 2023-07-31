import { useTranslation } from 'next-i18next'
import { DateFormatterOptions } from 'react-aria'

type Props = {
  children: string
  format?: CDateFormat
}

/**
 * It's hard to make up a name, name the format by the first usage. Then at the end we can change the naming.
 */
const formats = {
  default: { day: 'numeric', month: 'long', year: 'numeric' } as DateFormatterOptions,
  // short: { day: '2-digit', month: '2-digit', year: 'numeric' } as DateFormatterOptions,
}

type CDateFormat = keyof typeof formats

export const formatDate = (isoString: string, locale = 'sk', format: CDateFormat = 'default') => {
  const localeMapped = ({ sk: 'sk-SK', en: 'en-IE' } as const)[locale] ?? 'sk-SK'

  const date = new Date(isoString)

  return date.toLocaleDateString(localeMapped, formats[format])
}

const FormatDate = ({ children, format = 'default' }: Props) => {
  const { i18n } = useTranslation()
  const locale = i18n.language

  return <>{formatDate(children, locale, format)}</>
}

export default FormatDate
