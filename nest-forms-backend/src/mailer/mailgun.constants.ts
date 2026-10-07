import BaConfigService from '../config/ba-config.service'

export enum MailgunConfigVariableType {
  PARAMETER = 'PARAMETER',
  STRING = 'STRING',
  FEEDBACK_LINK = 'FEEDBACK_LINK',
}

type MailgunConfigVariableByType =
  | {
      type:
        | MailgunConfigVariableType.PARAMETER
        | MailgunConfigVariableType.STRING
      value: string
    }
  | { type: MailgunConfigVariableType.FEEDBACK_LINK }

interface MailgunConfig {
  template: string
  subject: string
  renderLocally?: boolean
  variables: Record<string, MailgunConfigVariableByType>
}

export function getMailgunConfig(
  baConfigService: BaConfigService,
): Record<string, MailgunConfig> {
  return {
    GINIS_SENT: {
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
          value: baConfigService.frontend.url,
        },
        feedbackLink: {
          type: MailgunConfigVariableType.FEEDBACK_LINK,
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
          value: baConfigService.frontend.url,
        },
        feedbackLink: {
          type: MailgunConfigVariableType.FEEDBACK_LINK,
        },
      },
    },
    GINIS_IN_PROGRESS: {
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
          value: baConfigService.frontend.url,
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
          value: baConfigService.frontend.url,
        },
        feedbackLink: {
          type: MailgunConfigVariableType.FEEDBACK_LINK,
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
          value: baConfigService.frontend.url,
        },
        feedbackLink: {
          type: MailgunConfigVariableType.FEEDBACK_LINK,
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
          value: baConfigService.frontend.url,
        },
        slug: {
          type: MailgunConfigVariableType.PARAMETER,
          value: `${baConfigService.frontend.url}/{{slug}}/{{formId}}`,
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
          value: baConfigService.olo.frontendUrl,
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
      renderLocally: true,
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
          type: MailgunConfigVariableType.FEEDBACK_LINK,
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
          type: MailgunConfigVariableType.FEEDBACK_LINK,
        },
      },
    },
    BRATISLAVA_NEW_SUBMISSION: {
      template: '2026-bratislava-new-submission',
      subject: 'Bratislavské konto: Nové podanie',
      variables: {
        applicationName: {
          type: MailgunConfigVariableType.PARAMETER,
          value: '{{messageSubject}}',
        },
        htmlData: {
          type: MailgunConfigVariableType.PARAMETER,
          value: '{{htmlData}}',
        },
        formSentAt: {
          type: MailgunConfigVariableType.PARAMETER,
          value: '{{formSentAt}}',
        },
      },
    },
    BRATISLAVA_SENT_SUCCESS: {
      template: '2026-bratislava-form-success',
      subject: 'Bratislavské konto: Vaša žiadosť bola odoslaná',
      variables: {
        applicationName: {
          type: MailgunConfigVariableType.PARAMETER,
          value: '{{messageSubject}}',
        },
        feHost: {
          type: MailgunConfigVariableType.STRING,
          value: baConfigService.frontend.url,
        },
        firstName: {
          type: MailgunConfigVariableType.PARAMETER,
          value: '{{firstName}}',
        },
        formSentAt: {
          type: MailgunConfigVariableType.PARAMETER,
          value: '{{formSentAt}}',
        },
      },
    },
    PAAS_CONTACT_FORM_SENT_SUCCESS: {
      template: '2026-city-account-paas-contact-form-success',
      subject: 'PAAS: Vaša požiadavka bola odoslaná',
      variables: {
        applicationName: {
          type: MailgunConfigVariableType.PARAMETER,
          value: '{{messageSubject}}',
        },
        feHost: {
          type: MailgunConfigVariableType.STRING,
          value: baConfigService.frontend.url,
        },
        firstName: {
          type: MailgunConfigVariableType.PARAMETER,
          value: '{{firstName}}',
        },
        formSentAt: {
          type: MailgunConfigVariableType.PARAMETER,
          value: '{{formSentAt}}',
        },
      },
    },
  }
}
