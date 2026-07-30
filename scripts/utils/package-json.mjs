import { readFile } from 'node:fs/promises'

export async function readPackageJson(packageJsonPath) {
  const contents = await readFile(packageJsonPath, 'utf8')

  try {
    return JSON.parse(contents)
  } catch (error) {
    throw new Error(`Failed to parse ${packageJsonPath}: ${error.message}`)
  }
}
