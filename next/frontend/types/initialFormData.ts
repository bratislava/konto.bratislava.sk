import { GetFileResponseDto } from '@clients/openapi-forms'
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'

export type InitialFormData = {
  slug: string
  formId: string
  schema: RJSFSchema
  uiSchema: UiSchema
  formDataJson: GenericObjectType
  files: GetFileResponseDto[]
  oldSchemaVersion: boolean
  formSent: boolean
  formMigrationRequired: boolean
  schemaVersionId: string
  isSigned?: boolean
  isTaxForm?: boolean
}
