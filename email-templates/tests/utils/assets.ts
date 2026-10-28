import { existsSync } from 'node:fs'
import path from 'node:path'

import { defaultAssetsBaseUrl } from '../../src/render/define-email'
import { exampleFixturesBaseUrl } from '../../src/render/examples'

const packageRoot = path.join(import.meta.dirname, '..', '..')
export const assetsRoot = path.join(packageRoot, 'assets')
const fixturesRoot = path.join(packageRoot, 'fixtures')

/**
 * The local file for a URL the emails load in tests: an asset (examples use the default assets
 * base URL) or an example fixture. Null for any other URL, or when the file doesn't exist.
 */
export const getLocalFilePath = (url: string) => {
  for (const [baseUrl, root] of [
    [defaultAssetsBaseUrl, assetsRoot],
    [exampleFixturesBaseUrl, fixturesRoot],
  ] as const) {
    if (url.startsWith(`${baseUrl}/`)) {
      const filePath = path.join(root, ...url.slice(baseUrl.length + 1).split('/'))
      return existsSync(filePath) ? filePath : null
    }
  }

  return null
}

const contentTypes: Record<string, string> = {
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

export const getContentType = (filePath: string) =>
  contentTypes[path.extname(filePath)] ?? 'application/octet-stream'
