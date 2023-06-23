import data from './stanoviskoKInvesticnemuZameru/data.json'
import pdfStylesheet from './stanoviskoKInvesticnemuZameru/form.fo.xslt'
import htmlStylesheet from './stanoviskoKInvesticnemuZameru/form.html.sef.json'
import textStylesheet from './stanoviskoKInvesticnemuZameru/form.sb.sef.json'
import schema from './stanoviskoKInvesticnemuZameru/schema.json'
import xsd from './stanoviskoKInvesticnemuZameru/schema.xsd'
import uiSchema from './stanoviskoKInvesticnemuZameru/uiSchema.json'
import xmlTemplate from './stanoviskoKInvesticnemuZameru/xmlTemplate'
import { RJSFSchema } from '@rjsf/utils'
import { FormDefinition } from '@backend/forms/types'

export default {
  schema: schema as unknown as RJSFSchema,
  uiSchema,
  xsd,
  xmlTemplate,
  textStylesheet,
  htmlStylesheet,
  pdfStylesheet,
  data,
} as FormDefinition
