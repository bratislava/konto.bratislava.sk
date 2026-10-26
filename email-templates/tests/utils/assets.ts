import { existsSync } from 'node:fs'
import path from 'node:path'

import { defaultAssetsBaseUrl } from '../../src/render/define-email'

export const assetsRoot = path.join(import.meta.dirname, '..', '..', 'assets')

/**
 * The local file for an asset URL the emails reference (they always use the default base URL in
 * tests), or null for any other URL.
 */
export const getAssetFilePath = (url: string) => {
  const prefix = `${defaultAssetsBaseUrl}/`
  if (!url.startsWith(prefix)) {
    return null
  }
  const filePath = path.join(assetsRoot, ...url.slice(prefix.length).split('/'))

  return existsSync(filePath) ? filePath : null
}

const contentTypes: Record<string, string> = {
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

export const getContentType = (filePath: string) =>
  contentTypes[path.extname(filePath)] ?? 'application/octet-stream'
