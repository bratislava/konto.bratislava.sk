import { readFile } from 'node:fs/promises'

/**
 * Only the fields these scripts read are named; everything else stays `unknown`
 * so it has to be narrowed before use. Values are whatever the file happens to
 * contain, which is the point -- the scripts exist to catch the wrong ones.
 */
export type PackageJson = {
  devEngines?: Record<string, unknown>
  packageManager?: unknown
  volta?: unknown
  [field: string]: unknown
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function readPackageJson(packageJsonPath: string) {
  const contents = await readFile(packageJsonPath, 'utf8')

  try {
    return JSON.parse(contents) as PackageJson
  } catch (error) {
    throw new Error(
      `Failed to parse ${packageJsonPath}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
