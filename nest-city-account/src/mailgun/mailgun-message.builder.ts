import { MAILGUN } from '../user-verification/constants'
import { MailgunMessageData } from 'mailgun.js/definitions'
import { Injectable } from '@nestjs/common'

interface BaseMailgunParams {
  to: string
  variables: Record<string, string | null>
}

interface RegistrationSuccessfulMailgunParams extends BaseMailgunParams {
  variables: {
    firstName: string | null
  }
}

interface IdentityCheckSuccessfulMailgunParams extends BaseMailgunParams {
  variables: {
    firstName: string | null
  }
}

interface IdentityCheckRejectedMailgunParams extends BaseMailgunParams {
  variables: {
    firstName: string | null
  }
}

interface DeliveryMethodChangedMailgunParams extends BaseMailgunParams {
  variables: {
    firstName: string | null
    year: string
    type: 'CITY' | 'POSTAL' | 'EDESK'
  }
  attachment?: {
    data: Buffer
    filename: string
    contentType: string
  }
}

@Injectable()
export class MailgunMessageBuilder {
  async '2023-registration-successful'({
    to,
    variables,
  }: RegistrationSuccessfulMailgunParams): Promise<MailgunMessageData> {
    return {
      from: MAILGUN.FROM_EMAIL,
      to,
      subject: 'Vitajte v Bratislavskom konte',
      template: '2023-registration-successful',
      'h:X-Mailgun-Variables': JSON.stringify(variables),
    }
  }

  async '2023-identity-check-successful'({
    to,
    variables,
  }: IdentityCheckSuccessfulMailgunParams): Promise<MailgunMessageData> {
    return {
      from: MAILGUN.FROM_EMAIL,
      to,
      subject: 'Vaša identita v Bratislavskom konte bola overená',
      template: '2023-identity-check-successful',
      'h:X-Mailgun-Variables': JSON.stringify(variables),
    }
  }

  async '2023-identity-check-rejected'({ to, variables }: IdentityCheckRejectedMailgunParams) {
    return {
      from: MAILGUN.FROM_EMAIL,
      to,
      subject: 'Vašu identitu sa v Bratislavskom konte nepodarilo overiť',
      template: '2023-identity-check-rejected',
      'h:X-Mailgun-Variables': JSON.stringify(variables),
    }
  }

  async '2025-delivery-method-changed'({
    to,
    variables,
    attachment,
  }: DeliveryMethodChangedMailgunParams): Promise<MailgunMessageData> {
    return {
      from: MAILGUN.FROM_EMAIL,
      to,
      subject: 'Váš spôsob doručenia v Bratislavskom konte sa zmenil',
      template: '2025-delivery-method-changed',
      'h:X-Mailgun-Variables': JSON.stringify(variables),
      ...(attachment && { attachment }),
    }
  }
}

export type MailgunTemplates = {
  [K in keyof MailgunMessageBuilder]: MailgunMessageBuilder[K]
}
