import { readCatalogVersions } from './utils/catalog-versions.ts'
import { isExactVersion } from './utils/exact-version.ts'
import { isRecord, readPackageJson } from './utils/package-json.ts'
import { pnpmWorkspaceYamlPath, relativeToRepositoryRoot, rootPackageJsonPath, } from './utils/repository-paths.ts'
import { reportViolations } from './utils/violations.ts'
import { readPnpmWorkspacePackageJsonPaths } from './utils/workspaces.ts'

type Violation = {
  dependencyName: string
  filePath: string
  sectionName: string
  version: string
}

const enforcedSections = new Set([
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'overrides',
  'resolutions',
])

const allowedNonSemverPrefixes = [
  'catalog:',
  'file:',
  'git:',
  'git+',
  'github:',
  'http:',
  'https:',
  'npm:',
  'workspace:',
  './',
  '../',
]

function isAllowedDependencyVersion(value: unknown) {
  if (typeof value !== 'string') {
    return false
  }

  if (allowedNonSemverPrefixes.some((prefix) => value.startsWith(prefix))) {
    return true
  }

  return isExactVersion(value)
}

function formatVersion(version: unknown) {
  return typeof version === 'string' ? version : JSON.stringify(version)
}

async function main() {
  const packageJsonPaths = [rootPackageJsonPath, ...(await readPnpmWorkspacePackageJsonPaths())]
  const violations: Violation[] = []

  for (const packageJsonPath of packageJsonPaths) {
    const packageJson = await readPackageJson(packageJsonPath)

    for (const sectionName of enforcedSections) {
      const section = packageJson[sectionName]

      if (!isRecord(section)) {
        continue
      }

      for (const [dependencyName, version] of Object.entries(section)) {
        if (!isAllowedDependencyVersion(version)) {
          violations.push({
            dependencyName,
            filePath: relativeToRepositoryRoot(packageJsonPath),
            sectionName,
            version: formatVersion(version),
          })
        }
      }
    }
  }

  // Every `catalog:` reference resolves to an entry here, so the catalog is
  // where those pins have to be exact.
  const catalogVersions = await readCatalogVersions()

  for (const [dependencyName, version] of Object.entries(catalogVersions)) {
    if (!isExactVersion(version)) {
      violations.push({
        dependencyName,
        filePath: relativeToRepositoryRoot(pnpmWorkspaceYamlPath),
        sectionName: 'catalog',
        version: formatVersion(version),
      })
    }
  }

  reportViolations({
    violations,
    successMessage: `All enforced dependency versions are exact across ${packageJsonPaths.length} package.json files and the ${Object.keys(catalogVersions).length} pnpm catalog entries.`,
    failureHeading: 'Non-exact dependency versions found:',
    formatViolation: (violation) =>
      `${violation.filePath} :: ${violation.sectionName} :: ${violation.dependencyName} -> ${violation.version}`,
  })
}

await main()
