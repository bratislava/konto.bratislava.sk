import { generateAssetFiles } from './assets'
import { SharedLogger } from '../../src/utils/sharedLogger'

async function main() {
  const logger = new SharedLogger('generate.ts')
  try {
    await generateAssetFiles()
    logger.log('Asset files have been successfully generated.')
    process.exit(0)
  } catch (error) {
    logger.error('Failed to generate asset files:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
