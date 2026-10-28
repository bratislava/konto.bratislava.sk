import type { BrandConfig } from '../theme/brands'

export type Locale = 'sk' | 'en'

/**
 * Which privacy notice a citizen email ends with: the Bratislavské konto terms for emails about the
 * account and its services, the city's general page for services with their own accounts.
 */
export type PrivacyNotice = 'bratislavske-konto' | 'city'

type Partner = NonNullable<BrandConfig['partner']>

/** Sentence parts: plain text and links. */
export type RichText = Array<string | { label: string; url: string }>

type LayoutStrings = {
  greeting: (firstName: string | null) => string
  thanks: string
  signature: (partner: Partner | undefined) => string
  privacy: Record<PrivacyNotice, RichText>
  copyright: (year: number) => string
}

const cityPrivacyUrl = 'https://bratislava.sk/ochrana-osobnych-udajov'
const kontoPrivacyUrl =
  'https://bratislava.sk/dokumenty/podmienky-ochrany-sukromia-pre-bratislavske-konto'

export const layoutStrings: Record<Locale, LayoutStrings> = {
  sk: {
    greeting: (firstName) => (firstName ? `Dobrý deň, ${firstName},` : 'Dobrý deň,'),
    thanks: 'Ďakujeme, že využívate naše služby.',
    signature: (partner) =>
      partner
        ? `${partner.possessive} ${partner.name} & Hlavné mesto SR Bratislava`
        : 'Vaše Hlavné mesto SR Bratislava',
    privacy: {
      'bratislavske-konto': [
        'Informácie o spracúvaní osobných údajov v Bratislavskom konte nájdete v ',
        { label: 'Podmienkach ochrany súkromia pre Bratislavské konto', url: kontoPrivacyUrl },
        ', ďalšie informácie na stránke ',
        { label: 'Ochrana osobných údajov', url: cityPrivacyUrl },
        '.',
      ],
      city: [
        'Informácie o spracúvaní osobných údajov nájdete na stránke ',
        { label: 'Ochrana osobných údajov', url: cityPrivacyUrl },
        '.',
      ],
    },
    copyright: (year) => `© ${year} Hlavné mesto SR Bratislava`,
  },
  en: {
    greeting: (firstName) => (firstName ? `Hello ${firstName},` : 'Hello,'),
    thanks: 'Thank you for using our services.',
    signature: (partner) =>
      partner
        ? `Your ${partner.name} & Capital City of the Slovak Republic Bratislava`
        : 'Your Capital City of the Slovak Republic Bratislava',
    privacy: {
      'bratislavske-konto': [
        'You can find how we process personal data in Bratislavské konto in the ',
        { label: 'Bratislavské konto privacy terms', url: kontoPrivacyUrl },
        ', and more on the page ',
        { label: 'Personal data protection', url: cityPrivacyUrl },
        '.',
      ],
      city: [
        'You can find how we process personal data on the page ',
        { label: 'Personal data protection', url: cityPrivacyUrl },
        '.',
      ],
    },
    copyright: (year) => `© ${year} Capital City of the Slovak Republic Bratislava`,
  },
}
