import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  // temporarily everywhere, revert when there are sections which do not require login (remove also eslint disable)
  // eslint-disable-next-line no-secrets/no-secrets
  // const isStaging = environment.isStaging
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
