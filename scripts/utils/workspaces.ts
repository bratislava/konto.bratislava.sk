import { readFile } from 'node:fs/promises'

import { parse } from 'yaml'
import { isRecord } from './package-json.ts'
import { pnpmWorkspaceYamlPath, repositoryPath } from './repository-paths.ts'

/**
 * The `packages` list in pnpm-workspace.yaml is the single source of truth for
 * which directories are workspaces, so the scripts read it from there rather
 * than keeping a second copy in the root package.json. Glob patterns are
 * rejected rather than silently skipped, otherwise a workspace could quietly
 * escape verification.
 */
export async function readPnpmWorkspaceDirectories() {
  const contents = await readFile(pnpmWorkspaceYamlPath, 'utf8')
  const workspace: unknown = parse(contents)

  if (!isRecord(workspace)) {
    throw new Error(`Expected ${pnpmWorkspaceYamlPath} to contain a YAML mapping.`)
  }

  const { packages } = workspace

  if (!Array.isArray(packages) || packages.length === 0) {
    throw new Error(`Missing "packages" list in ${pnpmWorkspaceYamlPath}.`)
  }

  const directories: string[] = []

  for (const entry of packages) {
    if (typeof entry !== 'string' || entry === '') {
      throw new Error(
        `Expected "packages" entries to be non-empty strings in ${pnpmWorkspaceYamlPath}, found ${JSON.stringify(entry)}.`,
      )
    }

    if (/[*?![\]{}]/.test(entry)) {
      throw new Error(
        `Glob workspace patterns are not supported by this script: "${entry}" in ${pnpmWorkspaceYamlPath}.`,
      )
    }

    directories.push(entry)
  }

  return directories
}

export async function readPnpmWorkspacePackageJsonPaths() {
  const directories = await readPnpmWorkspaceDirectories()

  return directories.map((directory) => repositoryPath(directory, 'package.json'))
}
