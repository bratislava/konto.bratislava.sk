import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Writes `assets/manifest.json`: the SHA-256 of every published asset. Sent emails link to these
 * files for years, so a published file must never change or disappear; the tests compare the
 * assets with this manifest. To change an asset, add a file under a new name (or a new version
 * folder), then run this script.
 */

const assetsRoot = path.join(import.meta.dirname, '..', 'assets')
const manifestPath = path.join(assetsRoot, 'manifest.json')

const listFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath]
  })

const manifest = Object.fromEntries(
  listFiles(assetsRoot)
    .filter((filePath) => filePath !== manifestPath)
    .map((filePath): [string, string] => [
      path.relative(assetsRoot, filePath).split(path.sep).join('/'),
      createHash('sha256').update(readFileSync(filePath)).digest('hex'),
    ])
    .sort(([a], [b]) => (a < b ? -1 : 1)),
)

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(
  `${Object.keys(manifest).length} assets in ${path.relative(process.cwd(), manifestPath)}`,
)
