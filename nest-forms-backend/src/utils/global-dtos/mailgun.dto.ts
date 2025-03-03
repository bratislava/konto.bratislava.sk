import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'

export interface SendEmailInputDto {
  to: string
  template: MailgunTemplateEnum
  data: {
    formId: string
    messageSubject: string
    firstName: string | null
    slug: string
    htmlData?: string
  }
}

export interface SendEmailVariablesDto {
  applicationName?: string
  firstName?: string
  feHost?: string
  feedbackLinks?: string
  formId?: string
  htmlData?: string
}
