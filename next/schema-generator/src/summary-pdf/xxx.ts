import fs from 'fs'
import { promisify } from 'util'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { join } from 'path'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

async function generateCSS() {
  try {
    const css = await readFile(join(__dirname, 'styles.css'), 'utf8')
    const result = await postcss([
      tailwindcss(join(__dirname, 'tailwind.config.js')),
      autoprefixer,
    ]).process(css, {
      from: undefined,
    })

    await writeFile(join(__dirname, 'output.css'), result.css)
    console.log('Tailwind CSS generated successfully!')
  } catch (error) {
    console.error('Error generating Tailwind CSS:', error)
  }
}

generateCSS()
