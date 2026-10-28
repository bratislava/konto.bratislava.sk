import { type Brand, brands } from './brands'
import { colors, contentWidth } from './tokens'

/**
 * CSS for `<head>`. Each concern is its own `<style>` block: Gmail drops a whole block when it
 * dislikes any rule in it, so one unsupported selector can't take the rest down.
 *
 * Elements carry `ba-*` role classes; these rules recolour them. Inline styles hold the light
 * values, so every override needs `!important`.
 */

const inter = {
  weights: [400, 600, 700],
  // Unicode ranges of the @fontsource/inter subsets; Slovak needs latin-ext.
  subsets: {
    latin:
      'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    'latin-ext':
      'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
  },
} as const

/** Self-hosted Inter. `mso-font-alt` is a second line of defence; Outlook never sees this block. */
export const getFontFaceCss = (assetUrl: (path: string) => string) =>
  inter.weights
    .flatMap((weight) =>
      Object.entries(inter.subsets).map(([subset, unicodeRange]) => {
        const file = `fonts/inter-${subset}-${weight}-normal`
        return `@font-face{font-family:'Inter';font-style:normal;font-weight:${weight};mso-font-alt:'Arial';src:url('${assetUrl(`${file}.woff2`)}') format('woff2'),url('${assetUrl(`${file}.woff`)}') format('woff');unicode-range:${unicodeRange}}`
      }),
    )
    .join('')

/** Classic Outlook doesn't inherit fonts into nested tables and would fall back to Times. */
export const outlookCss =
  'body,table,td,th,p,a,span,h1,h2,h3,li{font-family:Arial,Helvetica,sans-serif !important}'

export const colorSchemeCss = ':root{color-scheme:light dark;supported-color-schemes:light dark}'

const buttonDarkRules = (Object.keys(brands) as Brand[])
  .filter((brand) => {
    const { light, dark } = brands[brand].button
    return light.background !== dark.background || light.text !== dark.text
  })
  .map((brand) => {
    const { dark } = brands[brand].button
    return `.ba-button-${brand}{background-color:${dark.background} !important}.ba-button-${brand} a{color:${dark.text} !important}`
  })
  .join('')

/** `background` selectors take the background prefix, the rest the text prefix. */
const darkRules = ({ background, text }: { background: string; text: string }) =>
  [
    `${background}.ba-page{background-color:${colors.dark.page} !important}`,
    `${background}.ba-surface{background-color:${colors.dark.surface} !important}`,
    `${background}.ba-code{background-color:${colors.dark.codeBackground} !important}`,
    `${text}.ba-text{color:${colors.dark.text} !important}`,
    `${text}.ba-text-secondary{color:${colors.dark.textSecondary} !important}`,
    `${text}.ba-error{color:${colors.dark.error} !important}`,
    `${text}.ba-divider{border-color:${colors.dark.divider} !important}`,
    `${text}.ba-light-only{display:none !important}`,
    `${text}.ba-dark-only{display:block !important;max-height:none !important;overflow:visible !important}`,
  ].join('')

/** Apple Mail, iOS Mail, Outlook for Mac, Thunderbird and new Outlook honour `prefers-color-scheme`. */
export const darkModeCss = `@media (prefers-color-scheme: dark){${darkRules({ background: '', text: '' })}${buttonDarkRules}}`

/**
 * Outlook.com and the Outlook apps darken emails themselves and mark the elements they recoloured
 * with `data-ogsb` (background) and `data-ogsc` (text colour).
 */
export const outlookComDarkModeCss = darkRules({
  background: '[data-ogsb] ',
  text: '[data-ogsc] ',
})

export const responsiveCss = `@media (max-width:${contentWidth + 32}px){.ba-outer{padding:16px 8px !important}.ba-content{padding-left:16px !important;padding-right:16px !important}}`
