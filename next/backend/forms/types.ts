import { RJSFSchema, UiSchema } from '@rjsf/utils'

export interface FormDefinition {
  schema: RJSFSchema
  uiSchema: UiSchema<any, any>
  xsd: string
  data: any
  xmlTemplate: string
  textStylesheet?: any
  htmlStylesheet?: any
  pdfStylesheet?: string
}
