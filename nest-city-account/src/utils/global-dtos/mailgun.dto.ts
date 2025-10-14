import { MAILGUN } from '../../user-verification/constants'
import { MailgunMessageData } from 'mailgun.js/definitions'

interface RegistrationSuccessfulMailgunParams {
  to: string
  variables: {
    firstName: string | null
  }
}

export const registrationSuccessfulTemplate = ({
  to,
  variables,
}: RegistrationSuccessfulMailgunParams) => ({
  from: MAILGUN.FROM_EMAIL,
  to,
  subject: 'Vitajte v Bratislavskom konte',
  template: '2023-registration-successful',
  'h:X-Mailgun-Variables': JSON.stringify(variables),
})

interface IdentityCheckSuccessfulMailgunParams {
  to: string
  variables: {
    firstName: string | null
  }
}

export const identityCheckSuccessfulTemplate = ({
  to,
  variables,
}: IdentityCheckSuccessfulMailgunParams) => ({
  from: MAILGUN.FROM_EMAIL,
  to,
  subject: 'Vaša identita v Bratislavskom konte bola overená',
  template: '2023-identity-check-successful',
  'h:X-Mailgun-Variables': JSON.stringify(variables),
})

interface IdentityCheckRejectedMailgunParams {
  to: string
  variables: {
    firstName: string | null
  }
}

export const identityCheckRejectedTemplate = ({
  to,
  variables,
}: IdentityCheckRejectedMailgunParams) => ({
  from: MAILGUN.FROM_EMAIL,
  to,
  subject: 'Vašu identitu sa v Bratislavskom konte nepodarilo overiť',
  template: '2023-identity-check-rejected',
  'h:X-Mailgun-Variables': JSON.stringify(variables),
})

export const MailgunTemplates = {
export type MailgunTemplateParams = {
  '2023-registration-successful': RegistrationSuccessfulMailgunParams
  '2023-identity-check-successful': IdentityCheckSuccessfulMailgunParams
  '2023-identity-check-rejected': IdentityCheckRejectedMailgunParams
}

export type MailgunTemplateFunctions = {
  [K in keyof MailgunTemplateParams]: (params: MailgunTemplateParams[K]) => MailgunMessageData
}

export const MailgunTemplates: MailgunTemplateFunctions = {
  '2023-registration-successful': registrationSuccessfulTemplate,
  '2023-identity-check-successful': identityCheckSuccessfulTemplate,
  '2023-identity-check-rejected': identityCheckRejectedTemplate,
}
