import type { NextApiRequest, NextApiResponse } from 'next'

import { environment } from '@/environment'

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
