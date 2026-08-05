import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { Action } from './action'

export interface EmitOptions {
  out: string
}

export const emitAction: Action<EmitOptions> = {
  name: 'emit',
  description: 'Write the OpenAPI document to a JSON file.',

  configureOptions: (command) => {
    command.option(
      '--out <file>',
      'output file, relative to the backend directory',
      'openapi.json',
    )
  },

  run: async ({ document, backendDir }, { out }) => {
    const outFile = resolve(backendDir, out)
    await writeFile(outFile, JSON.stringify(document, null, 2))

    const paths = Object.keys(document.paths).length
    const schemas = Object.keys(document.components?.schemas ?? {}).length
    process.stdout.write(`${outFile} — ${paths} paths, ${schemas} schemas\n`)
  },
}
