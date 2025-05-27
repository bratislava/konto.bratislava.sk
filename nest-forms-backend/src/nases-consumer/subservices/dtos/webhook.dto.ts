export default interface WebhookDto {
  formId: string
  slug: string
  jsonVersion: string
  data: PrismaJson.FormDataJson
  files: Record<string, { url: string; fileName: string }>
}
