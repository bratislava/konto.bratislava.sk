import { readFile } from 'node:fs/promises'
import { createTwoFilesPatch } from 'diff'

import { CliError } from '../cli-error'
import type { Action } from './action'
import {
  configureSpecFileOption,
  describeDocument,
  displayPath,
  serializeSpec,
  type SpecFileOptions,
  specFilePath,
} from './spec-file'

/**
 * Fails when the committed spec no longer matches what the backend would produce.
 *
 * This is the check that makes committing specs worth anything: without it a spec can silently
 * fall behind its backend, and the stale version is what client generation would consume.
 */
export const specValidateAction: Action<SpecFileOptions> = {
  name: 'spec:validate',
  description:
    'Check the committed spec file matches the current code. Exits 1 with a diff if not.',

  configureOptions: configureSpecFileOption,

  run: async ({ document, backendDir, projectName }, { out }) => {
    const specPath = specFilePath(backendDir, projectName, out)
    const shown = displayPath(specPath)

    let committed: string
    try {
      committed = await readFile(specPath, 'utf8')
    } catch {
      throw new CliError(
        `${shown} does not exist — run "openapi-cli spec:generate" and commit it`,
      )
    }

    const generated = serializeSpec(document)
    if (committed === generated) {
      process.stdout.write(`${shown} is up to date — ${describeDocument(document)}\n`)
      return
    }

    // Unified diff, so the output reads the same way the eventual pull request will.
    process.stdout.write(
      createTwoFilesPatch(
        `${shown} (committed)`,
        `${shown} (generated)`,
        committed,
        generated,
      ),
    )
    process.stderr.write(
      `\n${shown} is out of date — run "openapi-cli spec:generate" and commit the result\n`,
    )
    process.exitCode = 1
  },
}
