import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import * as path from 'node:path'
import type { Config } from 'tailwindcss/types/config'

const tailwindConfig: Config = {
  content: [path.join(__dirname, './SummaryPdf.tsx')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}

const tailwindCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`

let generatedTailwindCss: string

export const getTailwindCss = async () => {
  if (generatedTailwindCss) {
    return generatedTailwindCss
  }

  const postCssResult = await postcss([tailwindcss(tailwindConfig), autoprefixer]).process(
    tailwindCss,
    { from: undefined } /* Added { from: undefined } to avoid a warning */,
  )
  generatedTailwindCss = postCssResult.css

  return generatedTailwindCss
}
