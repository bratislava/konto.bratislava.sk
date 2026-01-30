import * as fs from 'fs/promises'
import * as path from 'path'
import { get as getAppRootDir } from 'app-root-dir'
import { exampleForms } from '../src/example-forms/exampleForms'

/**
 * Saves example forms to JSON files in the `dist-example-forms` directory.
 *
 * It is possible to enable JSONs to be imported in the UI, this is useful for testing.
 */
async function saveExampleForms() {
  const rootDir = getAppRootDir()
  const outputDir = path.join(rootDir, 'dist-example-forms')

  await fs.mkdir(outputDir, { recursive: true })

  for (const examples of Object.values(exampleForms)) {
    for (const example of examples) {
      const fileName = `${example.name}.json`
      const filePath = path.join(outputDir, fileName)

      await fs.writeFile(filePath, JSON.stringify(example.formData, null, 2))
      console.log(`Saved ${fileName}`)
    }
  }

  console.log(`\nAll example forms have been saved to ${outputDir}`)
}

saveExampleForms().catch((error) => {
  console.error('An error occurred:', error)
  process.exit(1)
})
