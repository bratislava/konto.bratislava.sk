import { EFormValue } from '@backend/forms'
import {
  getEform,
  loadAndBuildXml,
  validateDataWithJsonSchema,
  validateDataWithXsd,
} from '@backend/utils/forms'
import { ErrorObject } from 'ajv'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../../frontend/utils/logger'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  logger.silly('-------------------')
  logger.silly('Validating form:', req.query.id)
  logger.silly(req.body)
  if (req.method !== 'POST')
    return res.status(400).json({ message: 'Invalid method or missing "data" field on body' })

  let eform: EFormValue
  try {
    eform = getEform(req.query.id)
  } catch (error) {
    logger.error(error)
    return res.status(400).json({ message: 'Invalid form name or url' })
  }

  let errors: Partial<ErrorObject>[] = []
  errors = await validateDataWithJsonSchema(req.body, eform.schema)
  if (errors.length > 0)
    return res.status(400).json({ message: `Data did not pass JSON validation`, errors })

  const xml = loadAndBuildXml(eform.xmlTemplate, req.body, eform.schema)
  errors = validateDataWithXsd(xml, eform.xsd)
  if (errors.length > 0)
    return res.status(400).json({ message: `Data did not pass XSD validation`, errors })

  // TODO when no errors, send the xml to slovensko.sk BE

  return res.status(200).json({})
}

export default handler
