const { glob } = require('glob')

const patterns = ['**/tests/**/*.{js,ts,jsx,tsx}', '**/*.{spec,test}.{js,ts,jsx,tsx}']

async function listTestFiles() {
  const files = []

  for (const pattern of patterns) {
    const matches = await glob(pattern, { ignore: ['node_modules/**'] })
    files.push(...matches)
  }

  // Remove duplicates and sort
  const uniqueFiles = [...new Set(files)].sort()

  // Print each file path
  uniqueFiles.forEach((file) => {
    console.log(`"${file}",`)
  })

  console.log(`\nTotal test files found: ${uniqueFiles.length}`)
}

listTestFiles().catch(console.error)
