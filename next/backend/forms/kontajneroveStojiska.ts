import data from './kontajneroveStojiska/data.json'
import pdfStylesheet from './kontajneroveStojiska/form.fo.xslt'
import htmlStylesheet from './kontajneroveStojiska/form.html.sef.json'
import textStylesheet from './kontajneroveStojiska/form.sb.sef.json'
import schema from './kontajneroveStojiska/schema.json'
import xsd from './kontajneroveStojiska/schema.xsd'
import uiSchema from './kontajneroveStojiska/uiSchema.json'
import xmlTemplate from './kontajneroveStojiska/xmlTemplate'
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
