import { MailgunTemplateEnum } from '../global-services/mailgun/mailgun.constants'

export interface SendEmailInputDto {
  to: string
  template: MailgunTemplateEnum
  data: {
    formId: string
    messageSubject: string
    firstName: string | null
    slug: string
  }
}

export interface SendEmailVariablesDto {
  applicationName?: string
  firstName?: string
  feHost?: string
  feedbackLinks?: string
  formId?: string
}
