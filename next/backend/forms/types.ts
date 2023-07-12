import { RJSFSchema, UiSchema } from '@rjsf/utils'

export interface FormDefinition {
  schema: RJSFSchema
  uiSchema: UiSchema
  xsd: string
  data: any
  xmlTemplate: string
  textStylesheet?: any
  htmlStylesheet?: any
  pdfStylesheet?: string
}
