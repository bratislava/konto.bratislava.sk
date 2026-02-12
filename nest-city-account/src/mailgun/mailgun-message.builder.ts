import { MAILGUN } from '../user-verification/constants'
import { MailgunMessageData } from 'mailgun.js/definitions'
import { Injectable } from '@nestjs/common'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service'

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

export interface DeliveryMethodChangedWithUserDataParams {
  userEmail: string
  externalId: string
  birthNumber?: string
  deliveryMethod: 'email' | 'edesk' | 'postal'
}

@Injectable()
export class MailgunMessageBuilder {
  constructor(
    private readonly cognitoSubservice: CognitoSubservice,
    private readonly pdfGeneratorService: PdfGeneratorService
  ) {}

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

  async '2025-delivery-method-changed-from-user-data'({
    userEmail,
    externalId,
    birthNumber,
    deliveryMethod,
  }: DeliveryMethodChangedWithUserDataParams): Promise<MailgunMessageData> {
    const cognitoData = await this.cognitoSubservice.getDataFromCognito(externalId)
    const firstName = cognitoData.given_name

    const variables = {
      firstName: firstName ?? null,
      year: new Date().getFullYear().toString(),
      deliveryMethod,
    }

    const baseMessage: MailgunMessageData = {
      from: MAILGUN.FROM_EMAIL,
      to: userEmail,
      subject: 'Váš spôsob doručenia v Bratislavskom konte sa zmenil',
      template: '2025-delivery-method-changed-notify',
      'h:X-Mailgun-Variables': JSON.stringify(variables),
    }

    // Only generate PDF attachment for 'email' delivery method (CITY_ACCOUNT)
    if (deliveryMethod === 'email' && birthNumber) {
      const fullName = `${cognitoData.given_name ?? ''} ${cognitoData.family_name ?? ''}`.trim()

      const pdfFile = await this.pdfGeneratorService.generateFromTemplate(
        'delivery-method-set-to-notification',
        'oznamenie.pdf',
        {
          email: userEmail,
          name: fullName,
          birthNumber,
          date: new Date().toLocaleDateString('sk'),
        },
        birthNumber
      )

      baseMessage.attachment = pdfFile
    }

    return baseMessage
  }
}

export type MailgunTemplates = {
  [K in keyof MailgunMessageBuilder]: MailgunMessageBuilder[K]
}
