import { formDefinitions } from 'forms-shared/definitions/formDefinitions'

/* eslint-disable no-secrets/no-secrets */
export enum MailgunConfigVariableType {
  PARAMETER = 'PARAMETER',
  SELECT = 'SELECT',
  STRING = 'STRING',
}

export const MAILGUN_CONFIG_FEEDBACK_URLS = Object.fromEntries(
  formDefinitions
    .filter((formDefinition) => formDefinition.feedbackLink)
    .map((formDefinition) => [
      formDefinition.slug,
      formDefinition.feedbackLink,
    ]),
)

export const MAILGUN_CONFIG = {
  NASES_SENT: {
    template: '2023-application-status-sent',
    subject: 'Bratislavské konto: Vaša žiadosť bola odoslaná',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      firstName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{firstName}}',
      },
      feHost: {
        type: MailgunConfigVariableType.STRING,
        value: process.env.FRONTEND_URL || 'https://konto.bratislava.sk',
      },
      feedbackLink: {
        type: MailgunConfigVariableType.SELECT,
        value: MAILGUN_CONFIG_FEEDBACK_URLS,
        selectorVariable: 'slug',
      },
    },
  },
  GINIS_DELIVERED: {
    template: '2023-application-status-delivered',
    subject: 'Bratislavské konto: Vaša žiadosť bola doručená',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      firstName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{firstName}}',
      },
      feHost: {
        type: MailgunConfigVariableType.STRING,
        value: process.env.FRONTEND_URL || 'https://konto.bratislava.sk',
      },
      feedbackLink: {
        type: MailgunConfigVariableType.SELECT,
        value: MAILGUN_CONFIG_FEEDBACK_URLS,
        selectorVariable: 'slug',
      },
    },
  },
  NASES_GINIS_IN_PROGRESS: {
    template: '2023-application-status-in-progress',
    subject: 'Bratislavské konto: Na odoslaní Vašej žiadosti pracujeme',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      firstName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{firstName}}',
      },
      feHost: {
        type: MailgunConfigVariableType.STRING,
        value: process.env.FRONTEND_URL || 'https://konto.bratislava.sk',
      },
    },
  },
  GINIS_SUCCESS: {
    template: '2023-application-status-success',
    subject: 'Bratislavské konto: Vaša žiadosť bola vybavená',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      firstName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{firstName}}',
      },
      feHost: {
        type: MailgunConfigVariableType.STRING,
        value: process.env.FRONTEND_URL || 'https://konto.bratislava.sk',
      },
      feedbackLink: {
        type: MailgunConfigVariableType.SELECT,
        value: MAILGUN_CONFIG_FEEDBACK_URLS,
        selectorVariable: 'slug',
      },
    },
  },
  GINIS_DENIED: {
    template: '2023-application-status-denied',
    subject: 'Bratislavské konto: Vaša žiadosť bola zamietnutá',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      firstName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{firstName}}',
      },
      feHost: {
        type: MailgunConfigVariableType.STRING,
        value: process.env.FRONTEND_URL || 'https://konto.bratislava.sk',
      },
      feedbackLink: {
        type: MailgunConfigVariableType.SELECT,
        value: MAILGUN_CONFIG_FEEDBACK_URLS,
        selectorVariable: 'slug',
      },
    },
  },
  ATTACHMENT_VIRUS: {
    template: '2023-application-status-virus',
    subject: 'Bratislavské konto: Vo Vašej žiadosti sa nachádza vírus',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      firstName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{firstName}}',
      },
      feHost: {
        type: MailgunConfigVariableType.STRING,
        value: process.env.FRONTEND_URL || 'https://konto.bratislava.sk',
      },
      slug: {
        type: MailgunConfigVariableType.PARAMETER,
        value: `${
          process.env.FRONTEND_URL || 'https://konto.bratislava.sk'
        }/{{slug}}/{{formId}}`,
      },
    },
  },
  OLO_NEW_SUBMISSION: {
    template: 'olo-form-send',
    subject: 'OLO: Nové podanie',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      htmlData: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{htmlData}}',
      },
    },
  },
  OLO_SENT_SUCCESS: {
    template: '2024-olo-form-success',
    subject: 'OLO: Vaša žiadosť bola odoslaná',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      feHost: {
        type: MailgunConfigVariableType.STRING,
        value: process.env.OLO_FRONTEND_URL || 'https://olo.sk',
      },
      firstName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{firstName}}',
      },
    },
  },
  TSB_NEW_SUBMISSION: {
    template: 'tsb-form-send',
    subject: 'TSB: Nové podanie',
    variables: {
      slug: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{slug}}',
      },
      htmlData: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{htmlData}}',
      },
    },
  },
  TSB_ORDER_SENT_SUCCESS: {
    template: '2025-tsb-form-success',
    subject: 'TSB: Vaša objednávka bola odoslaná',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      firstName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{firstName}}',
      },
      feedbackLink: {
        type: MailgunConfigVariableType.SELECT,
        value: MAILGUN_CONFIG_FEEDBACK_URLS,
        selectorVariable: 'slug',
      },
    },
  },
  TSB_REQUEST_SENT_SUCCESS: {
    template: '2025-tsb-form-success',
    subject: 'TSB: Vaša žiadosť bola odoslaná',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      firstName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{firstName}}',
      },
      feedbackLink: {
        type: MailgunConfigVariableType.SELECT,
        value: MAILGUN_CONFIG_FEEDBACK_URLS,
        selectorVariable: 'slug',
      },
    },
  },
}
/* eslint-enable no-secrets/no-secrets */
