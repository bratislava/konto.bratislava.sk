import { environment } from 'environment'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  // temporarily everywhere, revert when there are sections which do not require login (remove also eslint disable)
  const { isStaging } = environment
  if (isStaging) {
    return res.send(
      `
      User-Agent: *
      Disallow: /
      `,
    )
  }
  return res.send(
    `
      User-Agent: *
      Disallow: /mestske-sluzby/priznanie-k-dani-z-nehnutelnosti-dev
      `,
  )
}

export default handler
