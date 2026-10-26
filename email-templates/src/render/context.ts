import { createContext, useContext } from 'react'

import type { Locale } from '../i18n/layout-strings'
import type { Brand } from '../theme/brands'

export type EmailContextValue = {
  brand: Brand
  locale: Locale
  /** Base URL of `assets/` (without the version). */
  assetsBaseUrl: string
  /** Time of rendering, for the copyright year; fixed in examples so snapshots stay stable. */
  now: Date
}

const EmailContext = createContext<EmailContextValue | null>(null)

/**
 * Must wrap `<Tailwind>`: React Email's Tailwind calls the components below it as plain functions,
 * so a provider inside it would not be seen.
 */
export const EmailContextProvider = EmailContext.Provider

export const useEmailContext = () => {
  const value = useContext(EmailContext)
  if (!value) {
    throw new Error('Email components must be rendered inside EmailContextProvider.')
  }

  return value
}

/** Assets are versioned: published files never change, so emails sent long ago keep working. */
export const assetsVersion = 'v1'

export const useAssetUrl = () => {
  const { assetsBaseUrl } = useEmailContext()

  return (path: string) => `${assetsBaseUrl.replace(/\/$/, '')}/${assetsVersion}/${path}`
}
