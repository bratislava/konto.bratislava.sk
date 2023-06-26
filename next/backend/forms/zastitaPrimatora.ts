import data from './zastitaPrimatora/data.json'
import pdfStylesheet from './zastitaPrimatora/form.fo.xslt'
import htmlStylesheet from './zastitaPrimatora/form.html.sef.json'
import textStylesheet from './zastitaPrimatora/form.sb.sef.json'
import schema from './zastitaPrimatora/schema.json'
import xsd from './zastitaPrimatora/schema.xsd'
import uiSchema from './zastitaPrimatora/uiSchema.json'
import xmlTemplate from './zastitaPrimatora/xmlTemplate'
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
