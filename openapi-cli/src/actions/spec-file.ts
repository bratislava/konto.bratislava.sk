import { relative, resolve } from 'node:path'
import type { OpenAPIObject } from '@nestjs/swagger'

import type { Command } from 'commander'

/**
 * Where specs live, relative to a backend package. Client generation reads from here, so
 * every backend writes to the same place under its own `projectName`.
 */
const SPECS_DIR = '../openapi-clients-v2/specs'

export interface SpecFileOptions {
  out?: string
}

export function configureSpecFileOption(command: Command): void {
  command.option(
    '--out <file>',
    `spec file, relative to the backend directory (default: ${SPECS_DIR}/<projectName>.json)`,
  )
}

export function specFilePath(
  backendDir: string,
  projectName: string,
  out: string | undefined,
): string {
  return resolve(backendDir, out ?? `${SPECS_DIR}/${projectName}.json`)
}

/**
 * The exact bytes a spec file holds. Shared so that generating and validating cannot
 * disagree about formatting — a mismatch there would show up as a permanently failing
 * validation that no regeneration could fix.
 */
export function serializeSpec(document: OpenAPIObject): string {
  // Trailing newline: the spec is a committed artifact, so it should look like every other
  // text file in the repo.
  return `${JSON.stringify(document, null, 2)}\n`
}

/** Paths are logged relative to the repo, since absolute ones are noise in CI output. */
export function displayPath(path: string): string {
  return relative(resolve(process.cwd(), '..'), path).replace(/\\/g, '/')
}

export function describeDocument(document: OpenAPIObject): string {
  const paths = Object.keys(document.paths).length
  const schemas = Object.keys(document.components?.schemas ?? {}).length
  return `${paths} paths, ${schemas} schemas`
}
