/* eslint @typescript-eslint/no-unsafe-member-access: "warn" */

import { FormDefinition } from '@backend/forms/types'
import { getFormDefinition } from '@backend/utils/forms'
import type { NextApiRequest, NextApiResponse } from 'next'

import { environmentServer } from '../../../../../environment.server'
import logger from '../../../../../frontend/utils/logger'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST' || typeof req.body?.data !== 'string') {
    return res.status(400).json({ message: 'Invalid method or missing "data" field on body' })
  }

  let formDefinition: FormDefinition
  try {
    formDefinition = getFormDefinition(req.query.id)
  } catch (error) {
    logger.error(error)
    return res.status(400).json({ message: 'Invalid form name or url' })
  }

  try {
    const response = await fetch(`${environmentServer.fopUrl}/fop`, {
      method: 'POST',
      body: JSON.stringify({ data: req.body.data, xslt: formDefinition.pdfStylesheet }),
    })
    if (response.ok) {
      const stream = response.body as unknown as NodeJS.ReadableStream
      return stream.pipe(res)
    }
    const error = await response.json()
    return res.status(response.status).json(error)
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export default handler
