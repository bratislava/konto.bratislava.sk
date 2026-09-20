import { randomUUID } from 'node:crypto'

import { BASE_URL } from '../playwright.config'
import { setRunId } from './runId'

const globalSetup = () => {
  const runId = randomUUID().slice(0, 8)
  setRunId(runId)

  console.log(`[e2e] run ${runId} against ${BASE_URL}`)
}

export default globalSetup
