import { GenericObjectType } from '@rjsf/utils'

export default interface WebhookDto {
  formId: string
  slug: string
  jsonVersion: string
  data: GenericObjectType
  files: Record<string, { url: string; fileName: string }>
}
