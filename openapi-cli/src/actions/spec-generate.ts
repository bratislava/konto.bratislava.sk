import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import type { Action } from './action'
import {
  configureSpecFileOption,
  describeDocument,
  displayPath,
  serializeSpec,
  type SpecFileOptions,
  specFilePath,
} from './spec-file'

export const specGenerateAction: Action<SpecFileOptions> = {
  name: 'spec:generate',
  description: 'Write the OpenAPI document to its spec file.',

  configureOptions: configureSpecFileOption,

  run: async ({ document, backendDir, projectName }, { out }) => {
    const specPath = specFilePath(backendDir, projectName, out)
    await mkdir(dirname(specPath), { recursive: true })
    await writeFile(specPath, serializeSpec(document))

    process.stdout.write(
      `${displayPath(specPath)} — ${describeDocument(document)}\n`,
    )
  },
}
