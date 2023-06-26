/* eslint @typescript-eslint/no-unsafe-member-access: "warn" */

import { FormDefinition } from '@backend/forms/types'
import { getFormDefinition } from '@backend/utils/forms'
import { transformSaxon } from '@backend/utils/xslt'
import type { NextApiRequest, NextApiResponse } from 'next'

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

  const stringData: string = typeof req.body.data === 'string' ? req.body.data : ''
  const data = await transformSaxon(formDefinition.textStylesheet, stringData)

  res.setHeader('Content-Type', 'text/plain')
  return res.send(data)
}

export default handler
