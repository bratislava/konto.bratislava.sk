import { SharedLogger } from '../src/utils/sharedLogger'

const logger = new SharedLogger('sandbox.ts')

async function main() {
  logger.log('Hello, world!')
}

main().catch((error) => {
  logger.error('An error occurred:', error)
  process.exit(1)
})
