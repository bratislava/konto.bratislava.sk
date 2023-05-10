import { EFormValue } from '@backend/forms'
import {
  buildXmlRecursive,
  getEform,
  validateDataWithJsonSchema,
  validateDataWithXsd,
} from '@backend/utils/forms'
import { ErrorObject } from 'ajv'
import * as cheerio from 'cheerio'
import { sendForm } from 'frontend/api/api'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../../frontend/utils/logger'

type Form = {
  data: Record<string, any>
  id: string
  token: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  logger.silly('-------------------')
  logger.silly('Validating form:', req.query.id)
  if (req.method !== 'POST')
    return res.status(400).json({ message: 'Invalid method or missing "data" field on body' })

  const { data, id, token }: Form = req.body
  let eform: EFormValue
  try {
    eform = getEform(req.query.id)
  } catch (error) {
    logger.error(error)
    return res.status(400).json({ message: 'Invalid form name or url' })
  }

  let errors: Partial<ErrorObject>[] = []
  errors = await validateDataWithJsonSchema(data, eform.schema)
  if (errors.length > 0)
    return res.status(400).json({ message: `Data did not pass JSON validation`, errors })

  const $ = cheerio.load(eform.xmlTemplate, { xmlMode: true, decodeEntities: false })
  buildXmlRecursive(['E-form', 'Body'], $, data, eform.schema)
  errors = validateDataWithXsd($.html(), eform.xsd)
  if (errors.length > 0)
    return res.status(400).json({ message: `Data did not pass XSD validation`, errors })

  // TODO when no errors, send the xml to slovensko.sk BE
  try {
    await sendForm(id, $('E-form Body').html(), req.headers.authorization)
    return res.status(200).json({ message: 'OK' })
  } catch (error) {
    return res.status(500).json({ message: 'Send form failed' })
  }
}

export default handler
