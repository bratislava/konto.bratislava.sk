import { readFile } from 'node:fs/promises'

import { readCatalogVersion } from './utils/catalog-versions.ts'
import { isRecord } from './utils/package-json.ts'
import {
  dockerBakeJsonPath,
  pnpmWorkspaceYamlPath,
  relativeToRepositoryRoot,
  rootPackageJsonPath,
} from './utils/repository-paths.ts'
import { readToolchainVersions } from './utils/toolchain-versions.ts'
import { reportViolations } from './utils/violations.ts'

type Violation = {
  variableName: string
  actual: string
  expected: string
  source: string
}

/**
 * Bake has no way to read the versions out of package.json -- its HCL dialect
 * ships no file-reading function -- so the Dockerfile build args are written
 * down a second time as bake variable defaults. This check keeps that copy
 * honest, the same way verify-toolchain-versions.ts keeps the workspace
 * package.json files honest.
 *
 * The defaults live in docker-bake.json rather than docker-bake.hcl precisely so
 * that reading them here is a JSON.parse. Nothing has to parse HCL, and the
 * check runs without Docker installed. Bake merges the two files on its own.
 */
async function readBakeVariables() {
  const contents = await readFile(dockerBakeJsonPath, 'utf8')
  const bakeFile: unknown = JSON.parse(contents)

  if (!isRecord(bakeFile) || !isRecord(bakeFile.variable)) {
    throw new Error(`Missing "variable" entries in ${dockerBakeJsonPath}.`)
  }

  return bakeFile.variable
}

function readVariableDefault(variables: Record<string, unknown>, variableName: string) {
  const variable = variables[variableName]

  if (!isRecord(variable)) {
    return undefined
  }

  return typeof variable.default === 'string' ? variable.default : undefined
}

async function main() {
  const { nodeVersion, pnpmVersion, turboVersion } = await readToolchainVersions()
  const playwrightVersion = await readCatalogVersion('playwright')

  const rootPackageJson = relativeToRepositoryRoot(rootPackageJsonPath)
  const pnpmWorkspaceYaml = relativeToRepositoryRoot(pnpmWorkspaceYamlPath)

  const expectedVariables = [
    {
      variableName: 'NODE_VERSION',
      expected: nodeVersion,
      source: `${rootPackageJson} :: devEngines.runtime.version`,
    },
    {
      variableName: 'PNPM_VERSION',
      expected: pnpmVersion,
      source: `${rootPackageJson} :: devEngines.packageManager.version`,
    },
    {
      variableName: 'TURBO_VERSION',
      expected: turboVersion,
      source: `${rootPackageJson} :: devDependencies.turbo`,
    },
    {
      variableName: 'PLAYWRIGHT_VERSION',
      expected: playwrightVersion,
      source: `${pnpmWorkspaceYaml} :: catalog.playwright`,
    },
  ]

  const variables = await readBakeVariables()
  const violations: Violation[] = []

  for (const { variableName, expected, source } of expectedVariables) {
    const actual = readVariableDefault(variables, variableName)

    if (actual === expected) {
      continue
    }

    violations.push({
      variableName,
      actual: actual ?? '<missing>',
      expected,
      source,
    })
  }

  reportViolations({
    violations,
    successMessage: `Docker build args in ${relativeToRepositoryRoot(dockerBakeJsonPath)} match the pinned versions (${expectedVariables.length} variables checked).`,
    failureHeading: `Docker build arg mismatches found in ${relativeToRepositoryRoot(dockerBakeJsonPath)}:`,
    formatViolation: (violation) =>
      [
        `variable.${violation.variableName}.default`,
        `  expected: ${violation.expected}  (from ${violation.source})`,
        `  actual:   ${violation.actual}`,
      ].join('\n'),
  })
}

await main()
