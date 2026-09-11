import { readFile } from 'node:fs/promises'

import { parse } from 'yaml'
import { isRecord } from './package-json.ts'
import { pnpmWorkspaceYamlPath } from './repository-paths.ts'

/**
 * The `catalog` in pnpm-workspace.yaml is the single source of truth for the
 * versions shared across workspaces, so Dockerfiles and CI read it from here
 * instead of from a workspace package.json, which only holds the `catalog:`
 * placeholder.
 */
export async function readCatalogVersions() {
  const contents = await readFile(pnpmWorkspaceYamlPath, 'utf8')
  const workspace: unknown = parse(contents)

  if (!isRecord(workspace)) {
    throw new Error(`Expected ${pnpmWorkspaceYamlPath} to contain a YAML mapping.`)
  }

  const catalog = workspace.catalog

  if (!isRecord(catalog) || Object.keys(catalog).length === 0) {
    throw new Error(`Missing "catalog" entries in ${pnpmWorkspaceYamlPath}.`)
  }

  // An unquoted entry such as `1.2` parses as a number rather than a string. The
  // tuple keeps the inferred return type a `Record<string, string>`.
  return Object.fromEntries(
    Object.entries(catalog).map(([packageName, version]) => [packageName, String(version)] as const),
  )
}

export async function readCatalogVersion(packageName: string) {
  const versions = await readCatalogVersions()
  const version = versions[packageName]

  if (version === undefined) {
    throw new Error(`Missing "catalog.${packageName}" in ${pnpmWorkspaceYamlPath}.`)
  }

  return version
}
