import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()

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

function isExactVersion(value) {
  if (typeof value !== 'string') {
    return false
  }

  if (allowedNonSemverPrefixes.some((prefix) => value.startsWith(prefix))) {
    return true
  }

  // Accept pinned semver versions, including prerelease/build metadata.
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value)
}

async function findPackageJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(directory, entry.name, 'package.json'))
}

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const packageJsonFiles = await findPackageJsonFiles(rootDir)
  const violations = []

  for (const packageJsonPath of packageJsonFiles) {
    if (!(await exists(packageJsonPath))) {
      continue
    }

    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))

    for (const sectionName of enforcedSections) {
      const section = packageJson[sectionName]

      if (!section || typeof section !== 'object') {
        continue
      }

      for (const [dependencyName, version] of Object.entries(section)) {
        if (!isExactVersion(version)) {
          violations.push({
            dependencyName,
            packageJsonPath: path.relative(rootDir, packageJsonPath),
            sectionName,
            version,
          })
        }
      }
    }
  }

  if (violations.length === 0) {
    console.log('All enforced dependency versions are exact.')
    return
  }

  console.error('Non-exact dependency versions found:\n')

  for (const violation of violations) {
    console.error(
      `${violation.packageJsonPath} :: ${violation.sectionName} :: ${violation.dependencyName} -> ${violation.version}`,
    )
  }

  process.exitCode = 1
}

await main()
