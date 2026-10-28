import type { Locale } from './layout-strings'

/** Dates and times in emails are always Bratislava time, wherever the server runs. */
const timeZone = 'Europe/Bratislava'

const intlLocales: Record<Locale, string> = { sk: 'sk-SK', en: 'en-GB' }

/** "15. 1. 2026" */
export const formatDate = (date: Date, locale: Locale) =>
  new Intl.DateTimeFormat(intlLocales[locale], {
    timeZone,
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date)

/** "10:30" */
export const formatTime = (date: Date, locale: Locale) =>
  new Intl.DateTimeFormat(intlLocales[locale], {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

/** "15. 1. 2026 o 10:30" */
export const formatDateTime = (date: Date, locale: Locale) =>
  `${formatDate(date, locale)} ${locale === 'sk' ? 'o' : 'at'} ${formatTime(date, locale)}`

/** "99,00 €" */
export const formatPrice = (amount: number, locale: Locale) =>
  new Intl.NumberFormat(intlLocales[locale], { style: 'currency', currency: 'EUR' }).format(amount)
