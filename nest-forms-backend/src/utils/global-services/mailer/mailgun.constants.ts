/* eslint-disable no-secrets/no-secrets */
export enum MailgunConfigVariableType {
  PARAMETER = 'PARAMETER',
  SELECT = 'SELECT',
  STRING = 'STRING',
}

export const MAILGUN_CONFIG_FEEDBACK_URLS = {
  'zavazne-stanovisko-k-investicnej-cinnosti':
    'https://bravo.staffino.com/bratislava/id=WW1vhwT6',
  'stanovisko-k-investicnemu-zameru':
    'https://bravo.staffino.com/bratislava/id=WW1hkstR',
  'priznanie-k-dani-z-nehnutelnosti':
    'https://bravo.staffino.com/bratislava/id=WW14qo6q',
  'oznamenie-o-poplatkovej-povinnosti-za-komunalne-odpady':
    'https://bravo.staffino.com/bratislava/id=WWFOtcNg',
}

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
    template: 'olo-form-send', // TODO change to TSB template
    subject: 'TSB: Nové podanie',
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
  TSB_SENT_SUCCESS: {
    template: '2024-olo-form-success', // TODO change to TSB template
    subject: 'TSB: Vaša žiadosť bola odoslaná',
    variables: {
      applicationName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{messageSubject}}',
      },
      feHost: {
        type: MailgunConfigVariableType.STRING,
        value:
          'https://bratislava.sk/mesto-bratislava/technicke-siete-bratislava',
      },
      firstName: {
        type: MailgunConfigVariableType.PARAMETER,
        value: '{{firstName}}',
      },
    },
  },
}
/* eslint-enable no-secrets/no-secrets */
