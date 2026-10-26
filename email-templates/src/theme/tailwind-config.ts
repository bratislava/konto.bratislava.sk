import { pixelBasedPreset, type TailwindConfig } from 'react-email'

import { colors, fontFamily } from './tokens'

/**
 * One config for every email: React Email caches the Tailwind setup per config. Only px sizes and
 * hex colours (`pixelBasedPreset`, colours from the tokens); Tailwind's named radii stay in `rem`
 * even with the preset, so radii are written as arbitrary px values. Dark mode is not done with
 * `dark:` utilities but with the `ba-*` role classes and `theme/head-styles.ts`.
 */
export const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        page: colors.light.page,
        surface: colors.light.surface,
        ink: colors.light.text,
        'ink-secondary': colors.light.textSecondary,
        divider: colors.light.divider,
        code: colors.light.codeBackground,
        error: colors.light.error,
      },
      fontFamily: {
        sans: [...fontFamily],
      },
    },
  },
} satisfies TailwindConfig
