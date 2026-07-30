import { isExactVersion } from './utils/exact-version.mjs'
import { readPackageJson } from './utils/package-json.mjs'
import { relativeToRepositoryRoot, rootPackageJsonPath } from './utils/repository-paths.mjs'
import { reportViolations } from './utils/violations.mjs'
import { readWorkspacePackageJsonPaths } from './utils/workspaces.mjs'

const enforcedSections = new Set([
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'overrides',
  'resolutions',
])

const allowedNonSemverPrefixes = [
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

function isAllowedDependencyVersion(value) {
  if (typeof value !== 'string') {
    return false
  }

  if (allowedNonSemverPrefixes.some((prefix) => value.startsWith(prefix))) {
    return true
  }

  return isExactVersion(value)
}

async function main() {
  const packageJsonPaths = [rootPackageJsonPath, ...(await readWorkspacePackageJsonPaths())]
  const violations = []

  for (const packageJsonPath of packageJsonPaths) {
    const packageJson = await readPackageJson(packageJsonPath)

    for (const sectionName of enforcedSections) {
      const section = packageJson[sectionName]

      if (!section || typeof section !== 'object') {
        continue
      }

      for (const [dependencyName, version] of Object.entries(section)) {
        if (!isAllowedDependencyVersion(version)) {
          violations.push({
            dependencyName,
            packageJsonPath: relativeToRepositoryRoot(packageJsonPath),
            sectionName,
            version,
          })
        }
      }
    }
  }

  reportViolations({
    violations,
    successMessage: `All enforced dependency versions are exact across ${packageJsonPaths.length} package.json files.`,
    failureHeading: 'Non-exact dependency versions found:',
    formatViolation: (violation) =>
      `${violation.packageJsonPath} :: ${violation.sectionName} :: ${violation.dependencyName} -> ${violation.version}`,
  })
}

await main()
