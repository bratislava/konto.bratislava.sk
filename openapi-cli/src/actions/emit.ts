import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import type { Action } from './action'

/**
 * Where specs live, relative to a backend package. Client generation reads from here, so
 * every backend writes to the same place under its own `projectName`.
 */
const SPECS_DIR = '../openapi-clients-v2/specs'

export interface EmitOptions {
  out?: string
}

export const emitAction: Action<EmitOptions> = {
  name: 'emit',
  description: 'Write the OpenAPI document to a JSON file.',

  configureOptions: (command) => {
    command.option(
      '--out <file>',
      `output file, relative to the backend directory (default: ${SPECS_DIR}/<projectName>.json)`,
    )
  },

  run: async ({ document, backendDir, projectName }, { out }) => {
    const outFile = resolve(
      backendDir,
      out ?? `${SPECS_DIR}/${projectName}.json`,
    )
    await mkdir(dirname(outFile), { recursive: true })
    // Trailing newline: the spec is a committed artifact, so it should look like every
    // other text file in the repo.
    await writeFile(outFile, `${JSON.stringify(document, null, 2)}\n`)

    const paths = Object.keys(document.paths).length
    const schemas = Object.keys(document.components?.schemas ?? {}).length
    process.stdout.write(`${outFile} — ${paths} paths, ${schemas} schemas\n`)
  },
}
