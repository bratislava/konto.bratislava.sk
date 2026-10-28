import type { Locale, RichText } from '../i18n/layout-strings'

/**
 * Who an email comes from. Every brand uses the same city layout; a brand only changes the subject
 * prefix, the partner logo and sign-off, and the button colours.
 */
export type Brand = 'bratislava' | 'olo' | 'tsb' | 'paas' | 'kupaliska'

export type Logo = {
  /** Path under `assets/v1/`. */
  path: string
  /** Variant for dark mode, when the logo is unreadable on a dark background. */
  darkPath?: string
  width: number
  height: number
  alt: string
}

type ButtonColors = { background: string; text: string }

export type BrandConfig = {
  subjectPrefix: string
  /** Partner organisation shown next to the city: header logo and sign-off. */
  partner?: {
    name: string
    /** Slovak possessive that agrees with the partner's name: "Vaše OLO", "Váš STARZ". */
    possessive: 'Vaše' | 'Váš'
    logo: Logo
    /** Added to the privacy notice when the partner processes personal data too. */
    privacy?: Record<Locale, RichText>
  }
  /**
   * Button colours, checked for WCAG AA contrast by the tests. The city's matches the web app's
   * primary button; partner colours come from their logos.
   */
  button: { light: ButtonColors; dark: ButtonColors }
}

const partnerPrivacy = (name: string, url: string): Record<Locale, RichText> => ({
  sk: [
    `Vaše osobné údaje spracúva aj spoločnosť ${name}, viac na stránke `,
    { label: `Ochrana osobných údajov ${name}`, url },
    '.',
  ],
  en: [`${name} processes your personal data too, see `, { label: `${name} privacy`, url }, '.'],
})

export const cityLogo: Logo = {
  path: 'logos/bratislava.png',
  width: 115,
  height: 40,
  alt: 'Bratislava',
}

export const brands: Record<Brand, BrandConfig> = {
  bratislava: {
    subjectPrefix: 'Bratislavské konto',
    button: {
      light: { background: '#333333', text: '#FFFFFF' },
      dark: { background: '#F5F5F5', text: '#1F1F1F' },
    },
  },
  olo: {
    subjectPrefix: 'OLO',
    partner: {
      name: 'OLO',
      possessive: 'Vaše',
      logo: { path: 'logos/olo.png', width: 124, height: 40, alt: 'OLO' },
      privacy: partnerPrivacy('OLO', 'https://www.olo.sk/ochrana-osobnych-udajov'),
    },
    button: {
      light: { background: '#F1B434', text: '#1F1F1F' },
      dark: { background: '#F1B434', text: '#1F1F1F' },
    },
  },
  tsb: {
    subjectPrefix: 'TSB',
    partner: {
      name: 'TSB',
      possessive: 'Vaše',
      logo: { path: 'logos/tsb.png', width: 59, height: 32, alt: 'TSB' },
    },
    button: {
      light: { background: '#754BFF', text: '#FFFFFF' },
      dark: { background: '#754BFF', text: '#FFFFFF' },
    },
  },
  paas: {
    subjectPrefix: 'PAAS',
    partner: {
      name: 'PAAS',
      possessive: 'Váš',
      logo: { path: 'logos/paas.png', width: 74, height: 40, alt: 'PAAS' },
      privacy: partnerPrivacy('PAAS', 'https://paas.sk/ochrana-osobnych-udajov/'),
    },
    button: {
      light: { background: '#71CA55', text: '#1F1F1F' },
      dark: { background: '#71CA55', text: '#1F1F1F' },
    },
  },
  kupaliska: {
    subjectPrefix: 'Kúpaliská',
    partner: {
      name: 'STARZ',
      possessive: 'Váš',
      logo: {
        path: 'logos/starz.png',
        darkPath: 'logos/starz-dark.png',
        width: 65,
        height: 40,
        alt: 'STARZ',
      },
    },
    button: {
      light: { background: '#07038C', text: '#FFFFFF' },
      dark: { background: '#7CCEF2', text: '#07038C' },
    },
  },
}
