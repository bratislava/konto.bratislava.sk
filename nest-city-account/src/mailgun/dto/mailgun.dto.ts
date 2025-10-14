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

interface DeliveryMethodSetToNotificationParams {
  to: string
  variables: {
    firstName: string
    lastName: string
  }
  attachment: { data: Buffer; filename: string }
  testMode?: boolean
}

export const deliveryMethodSetToNotificationTemplate = ({
  to,
  variables,
  attachment,
  testMode,
}: DeliveryMethodSetToNotificationParams): MailgunMessageData => ({
  from: MAILGUN.FROM_EMAIL,
  to,
  subject: 'Zmena spôsobu doručenia na oznam', // TODO subject needs to be set by @ZdenkoPek
  template: 'delivery-method-set-to-notification',
  't:variables': JSON.stringify(variables),
  attachment: {
    ...attachment,
    contentType: 'application/pdf',
  },
  'o:testmode': testMode ? 'yes' : 'no',
})

export type MailgunTemplateParams = {
  '2023-registration-successful': RegistrationSuccessfulMailgunParams
  '2023-identity-check-successful': IdentityCheckSuccessfulMailgunParams
  '2023-identity-check-rejected': IdentityCheckRejectedMailgunParams
  'delivery-method-set-to-notification': DeliveryMethodSetToNotificationParams
}

export type MailgunTemplateFunctions = {
  [K in keyof MailgunTemplateParams]: (params: MailgunTemplateParams[K]) => MailgunMessageData
}

export const MailgunTemplates: MailgunTemplateFunctions = {
  '2023-registration-successful': registrationSuccessfulTemplate,
  '2023-identity-check-successful': identityCheckSuccessfulTemplate,
  '2023-identity-check-rejected': identityCheckRejectedTemplate,
  'delivery-method-set-to-notification': deliveryMethodSetToNotificationTemplate,
}
