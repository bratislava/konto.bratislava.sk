import { generateAssetFiles } from './assets'

async function main() {
  try {
    await generateAssetFiles()
    console.log('Asset files have been successfully generated.')
    process.exit(0)
  } catch (error) {
    console.error('Failed to generate asset files:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
