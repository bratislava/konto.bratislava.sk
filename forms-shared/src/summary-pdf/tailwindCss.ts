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

export const getTailwindCss = async () => {
  const postCssResult = await postcss([tailwindcss(tailwindConfig), autoprefixer]).process(
    tailwindCss,
    { from: undefined } /* Required to avoid a warning */,
  )
  return postCssResult.css
}
