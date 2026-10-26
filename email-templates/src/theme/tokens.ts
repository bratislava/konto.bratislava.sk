/**
 * Design tokens of the shared layout. Values are px and hex only: classic Outlook ignores `rem`, and
 * email clients support neither CSS variables nor Tailwind 4's OKLCH palette. The neutral colours
 * follow the konto web app (`next/src/pages/globals.css`).
 */
export const colors = {
  light: {
    // grey-50, the web app's background-passive-primary
    page: '#F5F5F5',
    surface: '#FFFFFF',
    // grey-800, the web app's content-passive-primary
    text: '#1F1F1F',
    // grey-600
    textSecondary: '#5C5C5C',
    // grey-200, the web app's border-passive-primary
    divider: '#D6D6D6',
    codeBackground: '#F5F5F5',
  },
  dark: {
    page: '#121212',
    surface: '#1F1F1F',
    text: '#F5F5F5',
    textSecondary: '#ADADAD',
    divider: '#474747',
    codeBackground: '#333333',
  },
} as const

/** Inter where clients load web fonts (Apple Mail, iOS, Thunderbird, Samsung); Arial elsewhere. */
export const fontFamily = ['Inter', 'Arial', 'Helvetica', 'sans-serif'] as const

/** Width of the white card. */
export const contentWidth = 584
