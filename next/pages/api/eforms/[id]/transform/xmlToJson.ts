/* eslint @typescript-eslint/no-unsafe-member-access: "warn" */

import { FormDefinition } from '@backend/forms/types'
import { getFormDefinition, xmlToJson } from '@backend/utils/forms'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../../../frontend/utils/logger'

// takes slovensko.sk-ready xml (perhaps serialized from previously filled in eFrom and loaded into browser by user) and converts back to json which we can work with
// TODO figure out if usable or if it should be rewritten

// TODO needs verification & tests
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
  const data = await xmlToJson(stringData, formDefinition.schema)

  return res.json(data)
}

export default handler
