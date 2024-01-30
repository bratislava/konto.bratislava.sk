import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

import type { PdfPreviewPayload } from './pdf-preview'

const dataStore = new Map<string, PdfPreviewPayload>()

export type PdfPreviewDataStoreUuidResponse = {
  uuid: string
}

/**
 * It is not possible to pass data from `/api/pdf-preview` API route to `/pdf-preview/[uuid]` using:
 * - shared variables (neither via global), because Next provides different instances of them
 * - query params or headers, because the data is too big
 *
 * Therefore, this API route serves as an intermediary data store.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PdfPreviewDataStoreUuidResponse | PdfPreviewPayload | { error: string }>,
) {
  if (req.method === 'POST') {
    const generatedUuid = uuidv4()
    dataStore.set(generatedUuid, req.body as PdfPreviewPayload)
    // As the data store is in-memory and is set and read during the same process, we can safely delete the data after
    // 10 seconds as a way to clean up the memory.
    setTimeout(() => {
      dataStore.delete(generatedUuid)
    }, 10_000)

    return res.status(200).json({ uuid: generatedUuid })
  }

  if (req.method === 'GET') {
    const { uuid: retrievedUuid } = req.query as { uuid: string }
    const data = dataStore.get(retrievedUuid)
    if (data) {
      dataStore.delete(retrievedUuid)
      return res.status(200).json(data)
    }
    return res.status(404).json({ error: 'Data not found' })
  }

  res.setHeader('Allow', ['POST', 'GET'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
