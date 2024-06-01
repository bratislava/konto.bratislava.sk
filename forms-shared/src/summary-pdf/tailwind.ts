import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer' // Ensure you have this import
import * as path from 'node:path'

const tailwindConfig = {
  content: [path.join(__dirname, './SummaryPdf.tsx')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

const tailwindCss = `@tailwind base;
@tailwind components;
@tailwind utilities;



:root { font-family: 'Inter', sans-serif; }`

let generatedTailwindCss: string | undefined

export const getTailwindCss = async () => {
  if (generatedTailwindCss) {
    return generatedTailwindCss
  }

  // Directly use tailwindcss and autoprefixer in the postcss process
  generatedTailwindCss = await postcss([tailwindcss(tailwindConfig), autoprefixer])
    .process(tailwindCss, { from: undefined }) // Added { from: undefined } to avoid a warning
    .then((result) => {
      return result.css
    })

  return generatedTailwindCss!
}
