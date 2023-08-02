import { GetFileResponseDto } from '@clients/openapi-forms'

export type InitialFormData = {
  formDataJson: object
  formId: string
  files: GetFileResponseDto[]
}
