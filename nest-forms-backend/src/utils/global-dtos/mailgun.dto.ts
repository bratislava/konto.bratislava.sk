import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'

export interface SendEmailDataDto {
  formId: string
  messageSubject: string
  firstName: string | null
  slug: string
  formSentAt: Date | null
  htmlData?: string
}

export interface SendEmailInputDto {
  to: string
  template: MailgunTemplateEnum
  data: SendEmailDataDto
}

export interface SendEmailVariablesDto {
  applicationName?: string
  firstName?: string
  feHost?: string
  feedbackLink?: string
  formSentAt?: string
  htmlData?: string
  slug?: string
}
