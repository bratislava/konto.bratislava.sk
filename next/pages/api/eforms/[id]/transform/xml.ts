/* eslint @typescript-eslint/no-unsafe-member-access: "warn" */

import { FormDefinition } from '@backend/forms/types'
import { getFormDefinition, loadAndBuildXml } from '@backend/utils/forms'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../../../frontend/utils/logger'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST' || !req.body?.data)
    return res.status(400).json({ message: 'Invalid method or missing "data" field on body' })

  let formDefinition: FormDefinition
  try {
    formDefinition = getFormDefinition(req.query.id)
  } catch (error) {
    logger.error(error)
    return res.status(400).json({ message: 'Invalid form name or url' })
  }

  const xml = loadAndBuildXml(formDefinition.xmlTemplate, req.body.data, formDefinition.schema)
  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Content-Disposition', 'attachment; filename=test.xml')
  res.send(xml)
  return res.end()
}

export default handler
