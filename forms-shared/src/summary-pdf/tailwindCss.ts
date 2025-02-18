import postcss from 'postcss'
import tailwindPostcss from '@tailwindcss/postcss'
import path from 'path'
import fs from 'node:fs'

const baseCssPath = path.join(__dirname, './base.css')
const baseCss = fs.readFileSync(baseCssPath, 'utf8')

export const getTailwindCss = async () => {
  const result = await postcss([
    tailwindPostcss({
      base: baseCssPath,
      optimize: false,
    }),
  ]).process(baseCss, { from: baseCssPath })

  return result.css
}
