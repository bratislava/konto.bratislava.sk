import { EFormValue } from '@backend/forms'
import {
  getEform,
  loadAndBuildXml,
  validateDataWithJsonSchema,
  validateDataWithXsd,
} from '@backend/utils/forms'
import { sendForm } from '@utils/api'
import type { NextApiRequest, NextApiResponse } from 'next'

type Form = {
  data: Record<string, any>
  id: string
  token: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('-------------------')
  console.log('Validating form:', req.query.id)
  if (req.method !== 'POST')
    return res.status(400).json({ message: 'Invalid method or missing "data" field on body' })

  const { data, id, token }: Form = req.body
  let eform: EFormValue
  try {
    eform = getEform(req.query.id)
  } catch (error) {
    console.error(error)
    return res.status(400).json({ message: 'Invalid form name or url' })
  }

  let errors = []
  errors = await validateDataWithJsonSchema(data, eform.schema)
  if (errors.length > 0)
    return res.status(400).json({ message: `Data did not pass JSON validation`, errors })

  const xml = loadAndBuildXml(eform.xmlTemplate, data, eform.schema)
  errors = validateDataWithXsd(xml, eform.xsd)
  if (errors.length > 0)
    return res.status(400).json({ message: `Data did not pass XSD validation`, errors })

  // TODO when no errors, send the xml to slovensko.sk BE
  try {
    await sendForm(token, id)
    return res.status(200)
  } catch (error) {
    return res.status(500)
  }
}

export default handler
