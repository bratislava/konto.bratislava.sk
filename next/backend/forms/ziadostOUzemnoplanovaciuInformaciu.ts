import data from './ziadostOUzemnoplanovaciuInformaciu/data.json'
import pdfStylesheet from './ziadostOUzemnoplanovaciuInformaciu/form.fo.xslt'
import htmlStylesheet from './ziadostOUzemnoplanovaciuInformaciu/form.html.sef.json'
import textStylesheet from './ziadostOUzemnoplanovaciuInformaciu/form.sb.sef.json'
import schema from './ziadostOUzemnoplanovaciuInformaciu/schema.json'
import xsd from './ziadostOUzemnoplanovaciuInformaciu/schema.xsd'
import uiSchema from './ziadostOUzemnoplanovaciuInformaciu/uiSchema.json'
import xmlTemplate from './ziadostOUzemnoplanovaciuInformaciu/xmlTemplate'
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
