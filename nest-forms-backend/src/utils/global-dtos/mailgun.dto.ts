import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'

export interface SendEmailInputDto {
  to: string
  template: MailgunTemplateEnum
  data: {
    formId: string
    messageSubject: string
    firstName: string | null
    slug: string
    formSentAt: Date | null
    htmlData?: string
  }
}

export interface SendEmailVariablesDto {
  applicationName?: string
  firstName?: string
  feHost?: string
  feedbackLink?: string
  formId?: string
  htmlData?: string
  slug?: string
}
