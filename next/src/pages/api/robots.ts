import type { NextApiRequest, NextApiResponse } from 'next'

import { environment } from '@/src/environment'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  if (environment.isStaging) {
    return res.send(
      `
      User-Agent: *
      Disallow: /
      `,
    )
  }

  return res.send(`
      # Sitemaps
      Sitemap: https://konto.bratislava.sk/sitemap.xml
      `)
}

export default handler
