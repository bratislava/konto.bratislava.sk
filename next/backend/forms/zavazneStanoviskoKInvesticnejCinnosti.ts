import data from './zavazneStanoviskoKInvesticnejCinnosti/data.json'
import pdfStylesheet from './zavazneStanoviskoKInvesticnejCinnosti/form.fo.xslt'
import htmlStylesheet from './zavazneStanoviskoKInvesticnejCinnosti/form.html.sef.json'
import textStylesheet from './zavazneStanoviskoKInvesticnejCinnosti/form.sb.sef.json'
import schema from './zavazneStanoviskoKInvesticnejCinnosti/schema.json'
import xsd from './zavazneStanoviskoKInvesticnejCinnosti/schema.xsd'
import uiSchema from './zavazneStanoviskoKInvesticnejCinnosti/uiSchema.json'
import xmlTemplate from './zavazneStanoviskoKInvesticnejCinnosti/xmlTemplate'
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
