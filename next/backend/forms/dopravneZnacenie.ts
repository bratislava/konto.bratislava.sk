import data from './00603481.dopravneZnacenie.sk/data.json'
import pdfStylesheet from './00603481.dopravneZnacenie.sk/form.fo.xslt'
import htmlStylesheet from './00603481.dopravneZnacenie.sk/form.html.sef.json'
import textStylesheet from './00603481.dopravneZnacenie.sk/form.sb.sef.json'
import schema from './00603481.dopravneZnacenie.sk/schema.json'
import xsd from './00603481.dopravneZnacenie.sk/schema.xsd'
import uiSchema from './00603481.dopravneZnacenie.sk/uiSchema.json'
import xmlTemplate from './00603481.dopravneZnacenie.sk/xmlTemplate'
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
