import { isExactVersion } from './exact-version.mjs'
import { readPackageJson } from './package-json.mjs'
import { rootPackageJsonPath } from './repository-paths.mjs'

export const runtimeName = 'node'
export const packageManagerName = 'pnpm'
export const onFail = 'error'

function readDevEngineVersion(packageJson, sectionName, expectedName) {
  const section = packageJson.devEngines?.[sectionName]

  if (!section || typeof section !== 'object') {
    throw new Error(`Missing "devEngines.${sectionName}" in ${rootPackageJsonPath}.`)
  }

  if (section.name !== expectedName) {
    throw new Error(
      `Expected "devEngines.${sectionName}.name" to be "${expectedName}" in ${rootPackageJsonPath}, found "${section.name}".`,
    )
  }

  if (!isExactVersion(section.version)) {
    throw new Error(
      `Expected "devEngines.${sectionName}.version" to be an exact version in ${rootPackageJsonPath}, found "${section.version}".`,
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
  const turboVersion = packageJson.devDependencies?.turbo

  if (!isExactVersion(turboVersion)) {
    throw new Error(
      `Expected "devDependencies.turbo" to be an exact version in ${rootPackageJsonPath}, found "${turboVersion}".`,
    )
  }

  return { nodeVersion, pnpmVersion, turboVersion }
}

export function expectedDevEngines({ nodeVersion, pnpmVersion }) {
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

export function expectedPackageManager({ pnpmVersion }) {
  return `${packageManagerName}@${pnpmVersion}`
}

export function expectedRootVolta({ nodeVersion, pnpmVersion }) {
  return {
    [runtimeName]: nodeVersion,
    [packageManagerName]: pnpmVersion,
  }
}

// Workspaces inherit the root pins instead of repeating them.
export function expectedWorkspaceVolta() {
  return { extends: '../package.json' }
}
