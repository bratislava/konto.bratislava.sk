import { text } from 'node:stream/consumers'

import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '@/src/frontend/utils/logger'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function readBody(req: NextApiRequest): Promise<unknown> {
  try {
    const raw = await text(req)

    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

function logViolation(report: unknown): void {
  logger.warn(
    {
      timestamp: new Date().toISOString(),
      type: 'csp-violation',
      ...(report && typeof report === 'object' ? report : { raw: report }),
    },
    '[CSP violation]',
  )
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const payload = await readBody(req)

  // report-to (Reporting API): application/reports+json — array of reports
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const report = item?.type === 'csp-violation' && item?.body ? item.body : item
      logViolation(report)
    }

    return res.status(204).end()
  }

  // report-uri: application/csp-report — single object with "csp-report" key
  const report = payload?.['csp-report'] ?? payload
  logViolation(report)

  return res.status(204).end()
}
