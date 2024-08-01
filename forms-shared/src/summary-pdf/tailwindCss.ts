import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import * as path from 'node:path'
import type { Config } from 'tailwindcss/types/config'
import { get as getAppRootDir } from 'app-root-dir'

const rootDir = getAppRootDir()

const tailwindConfig: Config = {
  content: [path.join(rootDir, './/tests/slovensko-sk-xml/htmlx.ts')],
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
