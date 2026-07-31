import { isDeepStrictEqual } from 'node:util'

import { readPackageJson } from './utils/package-json.ts'
import { relativeToRepositoryRoot, rootPackageJsonPath } from './utils/repository-paths.ts'
import {
  expectedDevEngines,
  expectedPackageManager,
  expectedRootVolta,
  expectedWorkspaceVolta,
  readToolchainVersions,
} from './utils/toolchain-versions.ts'
import { reportViolations } from './utils/violations.ts'
import { readWorkspacePackageJsonPaths } from './utils/workspaces.ts'

type Violation = {
  packageJsonPath: string
  field: string
  actual: string
  expected: string
}

function compare({
  violations,
  packageJsonPath,
  field,
  actual,
  expected,
}: {
  violations: Violation[]
  packageJsonPath: string
  field: string
  actual: unknown
  expected: unknown
}): void {
  // Key order in package.json is irrelevant, and structural comparison ignores it.
  if (isDeepStrictEqual(actual, expected)) {
    return
  }

  violations.push({
    packageJsonPath: relativeToRepositoryRoot(packageJsonPath),
    field,
    actual: JSON.stringify(actual ?? null),
    expected: JSON.stringify(expected),
  })
}

async function main(): Promise<void> {
  const versions = await readToolchainVersions()

  const targets = [
    { packageJsonPath: rootPackageJsonPath, volta: expectedRootVolta(versions) },
    ...(await readWorkspacePackageJsonPaths()).map((packageJsonPath) => ({
      packageJsonPath,
      volta: expectedWorkspaceVolta(),
    })),
  ]

  const violations: Violation[] = []

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
