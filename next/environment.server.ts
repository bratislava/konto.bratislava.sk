/* eslint-disable no-process-env */

function assertEnv(variable: string): string {
  const value = process.env[variable]
  if (!value) {
    throw new Error(`Missing environment variable: ${variable}`)
  }
  return value
}

export const environmentServer = {
  fopUrl: assertEnv('FOP_URL'),
}
