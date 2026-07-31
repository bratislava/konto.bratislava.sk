import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Resolved from this file rather than `process.cwd()` so the scripts work no
// matter which directory they are invoked from.
export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

export function repositoryPath(...segments: string[]) {
  return path.join(repositoryRoot, ...segments)
}

export function relativeToRepositoryRoot(absolutePath: string) {
  return path.relative(repositoryRoot, absolutePath)
}

export const rootPackageJsonPath = repositoryPath('package.json')
export const pnpmWorkspaceYamlPath = repositoryPath('pnpm-workspace.yaml')
