import { isDeepEqual } from './utils/deep-equal.mjs'
import { readPackageJson } from './utils/package-json.mjs'
import { relativeToRepositoryRoot, rootPackageJsonPath } from './utils/repository-paths.mjs'
import {
  expectedDevEngines,
  expectedPackageManager,
  expectedRootVolta,
  expectedWorkspaceVolta,
  readToolchainVersions,
} from './utils/toolchain-versions.mjs'
import { reportViolations } from './utils/violations.mjs'
import { readWorkspacePackageJsonPaths } from './utils/workspaces.mjs'

function compare({ violations, packageJsonPath, field, actual, expected }) {
  if (isDeepEqual(actual, expected)) {
    return
  }

  violations.push({
    packageJsonPath: relativeToRepositoryRoot(packageJsonPath),
    field,
    actual: JSON.stringify(actual ?? null),
    expected: JSON.stringify(expected),
  })
}

async function main() {
  const versions = await readToolchainVersions()

  const targets = [
    { packageJsonPath: rootPackageJsonPath, volta: expectedRootVolta(versions) },
    ...(await readWorkspacePackageJsonPaths()).map((packageJsonPath) => ({
      packageJsonPath,
      volta: expectedWorkspaceVolta(),
    })),
  ]

  const violations = []

  for (const { packageJsonPath, volta } of targets) {
    const packageJson = await readPackageJson(packageJsonPath)

    compare({
      violations,
      packageJsonPath,
      field: 'devEngines',
      actual: packageJson.devEngines,
      expected: expectedDevEngines(versions),
    })

    compare({
      violations,
      packageJsonPath,
      field: 'packageManager',
      actual: packageJson.packageManager,
      expected: expectedPackageManager(versions),
    })

    compare({
      violations,
      packageJsonPath,
      field: 'volta',
      actual: packageJson.volta,
      expected: volta,
    })
  }

  reportViolations({
    violations,
    successMessage: `Toolchain versions are consistent across ${targets.length} package.json files (node ${versions.nodeVersion}, pnpm ${versions.pnpmVersion}, turbo ${versions.turboVersion}).`,
    failureHeading: `Toolchain version mismatches found (source of truth: ${rootPackageJsonPath}):`,
    formatViolation: (violation) =>
      [
        `${violation.packageJsonPath} :: ${violation.field}`,
        `  expected: ${violation.expected}`,
        `  actual:   ${violation.actual}`,
      ].join('\n'),
  })
}

await main()
