import { readPackageJson } from './package-json.mjs'
import { repositoryPath, rootPackageJsonPath } from './repository-paths.mjs'

/**
 * The `workspaces` array in the root package.json is the list every script
 * iterates over. Glob patterns are rejected rather than silently skipped,
 * otherwise a workspace could quietly escape verification.
 */
export async function readWorkspaceDirectories() {
  const { workspaces } = await readPackageJson(rootPackageJsonPath)

  if (!Array.isArray(workspaces) || workspaces.length === 0) {
    throw new Error(`Missing "workspaces" array in ${rootPackageJsonPath}.`)
  }

  for (const workspace of workspaces) {
    if (typeof workspace !== 'string' || workspace === '') {
      throw new Error(
        `Expected "workspaces" entries to be non-empty strings in ${rootPackageJsonPath}, found ${JSON.stringify(workspace)}.`,
      )
    }

    if (/[*?![\]{}]/.test(workspace)) {
      throw new Error(
        `Glob workspace patterns are not supported by this script: "${workspace}" in ${rootPackageJsonPath}.`,
      )
    }
  }

  return workspaces
}

export async function readWorkspacePackageJsonPaths() {
  const directories = await readWorkspaceDirectories()

  return directories.map((directory) => repositoryPath(directory, 'package.json'))
}
