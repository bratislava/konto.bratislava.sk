import type { OpenAPIObject } from '@nestjs/swagger'

import type { Backend } from './backend'
import { CliError } from './cli-error'
import { compileBackend } from './compile'
import { asOpenApiContract } from './contract'
import { installRequireHook } from './require-hook'
import { readSwaggerPluginOptions } from './swagger-plugin'
import { loadBackendToolchain } from './toolchain'
import { normalizePath } from './types'

/**
 * Compiles the backend, loads its contract and produces the document — the same one the
 * running server serves at `/api-json`, because it comes from the same factory.
 *
 * The app is created in preview mode, so no provider is instantiated and nothing connects to
 * a database or broker. That is only possible because the contract supplies its own port
 * rather than resolving one from a config provider.
 */
export async function buildDocument(
  backend: Backend,
): Promise<{ projectName: string; document: OpenAPIObject }> {
  const { directory, entryPath, tsconfigPath } = backend

  const swaggerOptions = readSwaggerPluginOptions(directory)
  const toolchain = loadBackendToolchain(directory)
  const sources = new Map<string, string>()

  try {
    compileBackend({
      typescript: toolchain.typescript,
      swaggerBefore: toolchain.swaggerBefore,
      swaggerOptions,
      backendDir: directory,
      tsconfigPath,
      sources,
    })

    const revertHook = installRequireHook({ sources, configPath: tsconfigPath })
    try {
      if (!sources.has(normalizePath(entryPath))) {
        throw new CliError(
          `${entryPath} is not in the file list of ${tsconfigPath} — check its "include"`,
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports -- served from memory
      // by the hook installed above.
      const contract = asOpenApiContract(require(entryPath), entryPath)

      const app = await toolchain.nestFactory.create(contract.AppModule, {
        preview: true,
        logger: false,
      })
      try {
        await contract.prepareApp?.(app)
        return {
          projectName: contract.projectName,
          document: contract.createSwaggerDocument(app),
        }
      } finally {
        // Without this the process keeps an open handle and never exits.
        await app.close()
      }
    } finally {
      revertHook()
    }
  } finally {
    toolchain.revert()
  }
}
