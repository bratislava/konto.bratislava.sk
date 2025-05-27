import { describe, expect, test } from 'vitest'
import { getRenderedAssets } from '../scripts/assets/assets'
import fs from 'fs/promises'

describe('Verify assets', () => {
  test('should have file contents that match the expected contents', async () => {
    const assets = await Promise.all(getRenderedAssets())
    await Promise.all(
      assets.map(async ({ path, content }) => {
        const fileContent = await fs.readFile(path, 'utf-8')
        // Normalize line endings to \n
        const normalizedFileContent = fileContent.replace(/\r\n/g, '\n')
        const normalizedContent = content.replace(/\r\n/g, '\n')

        expect(normalizedFileContent).toEqual(normalizedContent)
      }),
    )
  })
})
