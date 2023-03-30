import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  // temporarily everywhere, revert when going live-live
  // if (process.env.NEXT_PUBLIC_IS_STAGING === 'true') {
  if (true) {
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
