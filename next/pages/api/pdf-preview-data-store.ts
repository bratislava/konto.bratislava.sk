// pages/api/data.js
import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

import type { PdfPreviewPayload } from './pdf-preview'

// This will act as an in-memory storage for the example.
// In a production environment, you should use a proper database.
const dataStore = new Map<string, PdfPreviewPayload>()

export type PdfPreviewDataStoreUuidResponse = {
  uuid: string
}

// eslint-disable-next-line consistent-return
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PdfPreviewDataStoreUuidResponse | PdfPreviewPayload | { error: string }>,
) {
  if (req.method === 'POST') {
    const uuid = uuidv4()
    dataStore.set(uuid, req.body as PdfPreviewPayload)
    setTimeout(() => {
      dataStore.delete(uuid)
    }, 10_000)

    return res.status(200).json({ uuid })
  }
  if (req.method === 'GET') {
    const { uuid } = req.query
    const data = dataStore.get(uuid as string)
    if (data) {
      return res.status(200).json(data)
    }
    return res.status(404).json({ error: 'Data not found' })
  }

  res.setHeader('Allow', ['POST', 'GET'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
