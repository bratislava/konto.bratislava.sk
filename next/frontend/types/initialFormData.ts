import { GetFileResponseDto } from '@clients/openapi-forms'
import { GenericObjectType } from '@rjsf/utils'

export type InitialFormData = {
  formDataJson: GenericObjectType
  formId: string
  files: GetFileResponseDto[]
  oldSchemaVersion: boolean
  formSent: boolean
  formMigrationRequired: boolean
  schemaVersionId: string
}
