import { readFileSync } from 'fs'
import * as path from 'path'

const SLOVENSKO_MEF_JSON_URL = 'https://www.slovensko.sk/static/eForm/datasetexport/json/mef.json'

export const prepareDockerBuildArgs = async (projectRoot: string) => {
  const packageLockPath = path.join(projectRoot, 'package-lock.json')
  const packageLock = JSON.parse(readFileSync(packageLockPath, 'utf8'))
  const playwrightVersion = packageLock.packages?.['node_modules/playwright']?.version

  if (!playwrightVersion) {
    throw new Error(`Failed to resolve Playwright version from ${packageLockPath}.`)
  }

  const response = await fetch(SLOVENSKO_MEF_JSON_URL, { method: 'HEAD' })

  if (!response.ok) {
    throw new Error(
      `Failed to resolve Last-Modified header for ${SLOVENSKO_MEF_JSON_URL}. Status: ${response.status} ${response.statusText}`,
    )
  }

  const lastModified = response.headers.get('last-modified')

  if (!lastModified) {
    throw new Error(`Missing Last-Modified header for ${SLOVENSKO_MEF_JSON_URL}.`)
  }

  const lastModifiedTimestamp = Date.parse(lastModified)

  if (Number.isNaN(lastModifiedTimestamp)) {
    throw new Error(
      `Failed to parse Last-Modified header for ${SLOVENSKO_MEF_JSON_URL}: ${lastModified}`,
    )
  }

  const slovenskoMefJsonLastModified = Math.floor(lastModifiedTimestamp / 1000).toString()

  return {
    PLAYWRIGHT_VERSION: playwrightVersion,
    SLOVENSKO_MEF_JSON_LAST_MODIFIED: slovenskoMefJsonLastModified,
  }
}
