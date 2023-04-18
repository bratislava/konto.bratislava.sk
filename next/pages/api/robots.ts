import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  // temporarily everywhere, revert when going live-live (remove also eslint disable)
  // eslint-disable-next-line no-secrets/no-secrets
  // const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === 'true'
  const isStaging = true
  if (isStaging) {
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
