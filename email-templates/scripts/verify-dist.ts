import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

/**
 * Checks the built `dist/` the way consumers load it:
 * - Every `exports` entry loads with `require()`. The Nest backends are CommonJS and load this ESM
 *   package through Node's require(esm), which fails on top-level `await`.
 * - Only the form emails import forms-shared. It is an optional peer dependency, so everything
 *   else must work without it.
 */

const packageRoot = path.join(import.meta.dirname, '..')
const distRoot = path.join(packageRoot, 'dist')
const packageJson: unknown = JSON.parse(
  readFileSync(path.join(packageRoot, 'package.json'), 'utf8'),
)

if (
  typeof packageJson !== 'object' ||
  packageJson === null ||
  !('name' in packageJson) ||
  typeof packageJson.name !== 'string' ||
  !('exports' in packageJson) ||
  typeof packageJson.exports !== 'object' ||
  packageJson.exports === null
) {
  throw new Error('package.json must have a name and an exports map.')
}

// Resolving from the package root makes Node use the package's own `exports` (self-reference).
const require = createRequire(path.join(packageRoot, 'package.json'))
for (const subpath of Object.keys(packageJson.exports)) {
  if (subpath === './package.json') {
    continue
  }
  const specifier = `${packageJson.name}${subpath.slice(1)}`
  require(specifier)
  console.log(`require('${specifier}') works`)
}

/** Directories (relative to `dist/`, with forward slashes) whose modules may import forms-shared. */
const formsSharedAllowedIn = ['forms/', 'form-summary/', 'emails/forms/']

const listJsFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      return listJsFiles(entryPath)
    }
    return entry.name.endsWith('.js') ? [entryPath] : []
  })

const violations = listJsFiles(distRoot)
  .map((filePath) => path.relative(distRoot, filePath).split(path.sep).join('/'))
  .filter((relativePath) => !formsSharedAllowedIn.some((prefix) => relativePath.startsWith(prefix)))
  .filter((relativePath) =>
    /from\s*["']forms-shared[/"']|import\(\s*["']forms-shared[/"']/.test(
      readFileSync(path.join(distRoot, relativePath), 'utf8'),
    ),
  )

if (violations.length > 0) {
  throw new Error(
    `These modules import forms-shared but are not form emails: ${violations.join(', ')}`,
  )
}
console.log('Only form emails import forms-shared.')
