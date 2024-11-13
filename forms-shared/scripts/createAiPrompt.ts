import * as fs from 'fs/promises'
import * as glob from 'glob'
import * as prettier from 'prettier'
import { get as getAppRootDir } from 'app-root-dir'
import path from 'path'

const globs = [
  'src/generator/uiOptionsTypes.ts',
  'src/form-utils/ajvFormats.ts',
  'src/form-utils/ajvKeywords.ts',
  'src/schemas/**/*.ts',
]
const ignorePatterns = [
  'src/schemas/priznanie-k-dani-z-nehnutelnosti/esbsCiselniky.ts',
  'src/schemas/olo',
]

const rootDir = getAppRootDir()
const outputPath = path.join(rootDir, 'dist-schemas/prompt.txt')

async function createAiPrompt() {
  const prettierConfig = await prettier.resolveConfig(rootDir)
  let combinedContent = ''

  for (const pattern of globs) {
    const files = glob.sync(pattern, { ignore: ignorePatterns })

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8')
      const formattedContent = await prettier.format(content, {
        ...prettierConfig,
        parser: 'typescript',
        tabWidth: 0,
        printWidth: Infinity,
      })

      combinedContent += `// ${file}\n${formattedContent}\n\n`
    }
  }

  await fs.writeFile(outputPath, combinedContent)
  console.log(`Combined and formatted files written to ${outputPath}`)
}

createAiPrompt().catch((error) => {
  console.error('An error occurred:', error)
  process.exit(1)
})
