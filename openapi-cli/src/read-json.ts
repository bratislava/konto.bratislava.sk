import { readFileSync } from 'node:fs'

import { CliError } from './cli-error'

/**
 * Reads and parses a JSON file, distinguishing "missing" from "malformed".
 *
 * The cast is deliberate. Callers validate the one field they actually need, which is a
 * stronger guarantee than narrowing every level of the parsed shape would give.
 */
export function readJsonFile<T>(path: string, hint: string): T {
  let contents: string
  try {
    contents = readFileSync(path, 'utf8')
  } catch {
    throw new CliError(`cannot read ${path} — ${hint}`)
  }

  try {
    return JSON.parse(contents) as T
  } catch (error) {
    throw new CliError(
      `${path} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
