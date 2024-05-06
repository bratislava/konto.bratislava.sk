import { RJSFSchema, UiSchema } from '@rjsf/utils'

export default class FormDefinition {
  schema: RJSFSchema

  uiSchema: UiSchema

  xsd: string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any

  xmlTemplate: string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  textStylesheet?: any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  htmlStylesheet?: any

  pdfStylesheet?: string
}
