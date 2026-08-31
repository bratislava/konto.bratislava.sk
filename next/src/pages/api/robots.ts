import type { NextApiRequest, NextApiResponse } from 'next'

import { environment } from '@/src/environment'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  if (environment.isStaging) {
    return res.send(
      `
      User-Agent: *
      Disallow: /


      # Sitemaps
      Sitemap: ${process.env.NEXT_PUBLIC_SELF_URL}/sitemap.xml
      `,
    )
  }

  return res.send('')
}

export default handler
