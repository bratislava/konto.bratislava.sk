import { getRenderedAssets } from '../scripts/assets/assets'
import fs from 'fs/promises'

describe('Verify assets', () => {
  it('should have file contents that match the expected contents', async () => {
    const assets = await Promise.all(getRenderedAssets())
    await Promise.all(
      assets.map(async ({ path, content }) => {
        const fileContent = await fs.readFile(path, 'utf-8')
        expect(fileContent).toEqual(content)
      }),
    )
  })
})
