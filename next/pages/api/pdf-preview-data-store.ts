// pages/api/data.js
import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

import { PdfPreviewPayload } from './pdf-preview'

// This will act as an in-memory storage for the example.
// In a production environment, you should use a proper database.
const dataStore: Record<string, PdfPreviewPayload> = {}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const isLocalRequest =
    req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::1'

  if (!isLocalRequest) {
    return res.status(403).json({ error: 'Access denied' })
  }

  if (req.method === 'POST') {
    // Handle POST request: Save the data and return a UUID
    const uuid = uuidv4()
    dataStore[uuid] = req.body // In production, you'd save to a database
    res.status(200).json({ uuid })
  } else if (req.method === 'GET') {
    // Handle GET request: Retrieve data by UUID
    const { uuid } = req.query
    const data = dataStore[uuid as string]
    if (data) {
      res.status(200).json(data)
    } else {
      res.status(404).json({ error: 'Data not found' })
    }
  } else {
    // Handle other methods
    res.setHeader('Allow', ['POST', 'GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
