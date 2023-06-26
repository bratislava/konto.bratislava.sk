import data from './test/data.json'
import pdfStylesheet from './test/form.fo.xslt'
import htmlStylesheet from './test/form.html.sef.json'
import textStylesheet from './test/form.sb.sef.json'
import schema from './test/schema.json'
import xsd from './test/schema.xsd'
import uiSchema from './test/uiSchema.json'
import xmlTemplate from './test/xmlTemplate'
import { RJSFSchema } from '@rjsf/utils'
import { FormDefinition } from '@backend/forms/types'

export default {
  schema: schema as unknown as RJSFSchema,
  uiSchema,
  xsd,
  xmlTemplate,
  textStylesheet,
  htmlStylesheet,
  data,
  pdfStylesheet,
} as FormDefinition
