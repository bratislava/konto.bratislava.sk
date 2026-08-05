import { isExactVersion } from './exact-version.ts'
import { isRecord, readPackageJson, type PackageJson } from './package-json.ts'
import { rootPackageJsonPath } from './repository-paths.ts'

export const runtimeName = 'node'
export const packageManagerName = 'pnpm'
export const onFail = 'error'

export type ToolchainVersions = {
  nodeVersion: string
  pnpmVersion: string
  turboVersion: string
}

function readDevEngineVersion(packageJson: PackageJson, sectionName: string, expectedName: string) {
  const section = packageJson.devEngines?.[sectionName]

  if (!isRecord(section)) {
    throw new Error(`Missing "devEngines.${sectionName}" in ${rootPackageJsonPath}.`)
  }

  if (section.name !== expectedName) {
    throw new Error(
      `Expected "devEngines.${sectionName}.name" to be "${expectedName}" in ${rootPackageJsonPath}, found "${String(section.name)}".`,
    )
  }

  if (!isExactVersion(section.version)) {
    throw new Error(
      `Expected "devEngines.${sectionName}.version" to be an exact version in ${rootPackageJsonPath}, found "${String(section.version)}".`,
    )
  }

  return section.version
}

/**
 * The root package.json is the single source of truth for the toolchain. Every
 * workspace package.json and every Dockerfile derives its versions from here,
 * so bumping Node, pnpm or turbo is a one-line change in one file.
 */
export async function readToolchainVersions() {
  const packageJson = await readPackageJson(rootPackageJsonPath)

  const nodeVersion = readDevEngineVersion(packageJson, 'runtime', runtimeName)
  const pnpmVersion = readDevEngineVersion(packageJson, 'packageManager', packageManagerName)
  const turboVersion = isRecord(packageJson.devDependencies)
    ? packageJson.devDependencies.turbo
    : undefined

  if (!isExactVersion(turboVersion)) {
    throw new Error(
      `Expected "devDependencies.turbo" to be an exact version in ${rootPackageJsonPath}, found "${String(turboVersion)}".`,
    )
  }

  return { nodeVersion, pnpmVersion, turboVersion }
}

export function expectedDevEngines({ nodeVersion, pnpmVersion }: ToolchainVersions) {
  return {
    runtime: {
      name: runtimeName,
      version: nodeVersion,
      onFail,
    },
    packageManager: {
      name: packageManagerName,
      version: pnpmVersion,
      onFail,
    },
  }
}

export function expectedPackageManager({ pnpmVersion }: ToolchainVersions) {
  return `${packageManagerName}@${pnpmVersion}`
}

export function expectedRootVolta({ nodeVersion, pnpmVersion }: ToolchainVersions) {
  return {
    [runtimeName]: nodeVersion,
    [packageManagerName]: pnpmVersion,
  }
}

// Workspaces inherit the root pins instead of repeating them.
export function expectedWorkspaceVolta() {
  return { extends: '../package.json' }
}
