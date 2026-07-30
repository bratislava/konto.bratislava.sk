import { readFile } from 'node:fs/promises'

import { isExactVersion } from './exact-version.mjs'
import { pnpmWorkspaceYamlPath } from './repository-paths.mjs'

// Matches `  name: version` catalog entries, with or without quotes around either side.
const catalogEntryPattern =
  /^ {2}(?:'([^']+)'|"([^"]+)"|([^\s:]+))\s*:\s*(?:'([^']*)'|"([^"]*)"|(\S+))\s*$/

/**
 * The `catalog` in pnpm-workspace.yaml is the single source of truth for the
 * versions shared across workspaces, so Dockerfiles and CI read it from here
 * instead of from a workspace package.json, which only holds the `catalog:`
 * placeholder. Parsed line by line so the scripts keep running with bare
 * `node`, before anything is installed.
 */
export async function readCatalogVersions() {
  const contents = await readFile(pnpmWorkspaceYamlPath, 'utf8')
  const versions = {}
  let insideCatalog = false

  for (const line of contents.split('\n')) {
    const withoutCarriageReturn = line.replace(/\r$/, '')

    if (withoutCarriageReturn.trim() === '' || withoutCarriageReturn.trimStart().startsWith('#')) {
      continue
    }

    if (!/^\s/.test(withoutCarriageReturn)) {
      insideCatalog = withoutCarriageReturn.trim() === 'catalog:'
      continue
    }

    if (!insideCatalog) {
      continue
    }

    const match = catalogEntryPattern.exec(withoutCarriageReturn)

    if (!match) {
      throw new Error(
        `Failed to parse "catalog" entry in ${pnpmWorkspaceYamlPath}: ${withoutCarriageReturn}`
      )
    }

    const [, singleQuotedName, doubleQuotedName, bareName, singleQuoted, doubleQuoted, bare] = match
    versions[singleQuotedName ?? doubleQuotedName ?? bareName] =
      singleQuoted ?? doubleQuoted ?? bare
  }

  if (Object.keys(versions).length === 0) {
    throw new Error(`Missing "catalog" entries in ${pnpmWorkspaceYamlPath}.`)
  }

  return versions
}

export async function readCatalogVersion(packageName) {
  const versions = await readCatalogVersions()
  const version = versions[packageName]

  if (version === undefined) {
    throw new Error(`Missing "catalog.${packageName}" in ${pnpmWorkspaceYamlPath}.`)
  }

  if (!isExactVersion(version)) {
    throw new Error(
      `Expected "catalog.${packageName}" to be an exact version in ${pnpmWorkspaceYamlPath}, found "${version}".`
    )
  }

  return version
}
