import { environment } from 'environment'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  if (environment.isStaging) {
    return res.send(
      `
      User-Agent: *
      Disallow: /
      `,
    )
  }

  return res.send('')
}

export default handler
