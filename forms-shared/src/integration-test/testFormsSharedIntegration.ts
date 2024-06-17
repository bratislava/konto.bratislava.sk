import * as path from 'node:path'
import { promises as fsPromises } from 'fs'

export const testFormsSharedIntegration = async () => {
  const fileContents = await fsPromises.readFile(path.join(__dirname, './test'), 'utf8')

  return fileContents.length > 0
}
