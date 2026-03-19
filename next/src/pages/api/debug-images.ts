import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - internal Next.js field
  // eslint-disable-next-line no-underscore-dangle
  const config = (globalThis as any).__NEXT_IMAGE_OPTS

  res.status(200).json({
    images: config ?? null,
  })
}
