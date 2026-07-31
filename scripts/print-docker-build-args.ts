import { readCatalogVersion } from './utils/catalog-versions.ts'
import { readToolchainVersions } from './utils/toolchain-versions.ts'

/**
 * Prints the Docker build args as `KEY=value` lines, so they can be appended to
 * `$GITHUB_OUTPUT` in CI or turned into `--build-arg` flags locally. The
 * Dockerfiles declare these args without defaults, which keeps the root
 * package.json and the pnpm catalog the only places where the versions are
 * written down.
 */
async function main() {
  const { nodeVersion, pnpmVersion, turboVersion } = await readToolchainVersions()
  const playwrightVersion = await readCatalogVersion('playwright')

  const buildArgs = {
    NODE_VERSION: nodeVersion,
    PNPM_VERSION: pnpmVersion,
    TURBO_VERSION: turboVersion,
    PLAYWRIGHT_VERSION: playwrightVersion,
  }

  for (const [key, value] of Object.entries(buildArgs)) {
    console.log(`${key}=${value}`)
  }
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
