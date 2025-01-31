import glob from 'glob'
import path from 'path'

const patterns = ['**/tests/**/*.{js,ts,jsx,tsx}', '**/*.{spec,test}.{js,ts,jsx,tsx}']

async function listTestFiles() {
  const files: string[] = []

  for (const pattern of patterns) {
    const matches = await new Promise<string[]>((resolve, reject) => {
      glob(pattern, { ignore: ['node_modules/**'] }, (err, matches) => {
        if (err) reject(err)
        resolve(matches)
      })
    })
    files.push(...matches)
  }

  // Remove duplicates and sort
  const uniqueFiles = [...new Set(files)].sort()

  // Print each file path
  uniqueFiles.forEach((file) => {
    console.log(file)
  })

  console.log(`\nTotal test files found: ${uniqueFiles.length}`)
}

listTestFiles().catch(console.error)
