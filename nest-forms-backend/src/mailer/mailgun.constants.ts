import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'

import BaConfigService from '../config/ba-config.service'
import {
  SendEmailDataDto,
  SendEmailVariablesDto,
} from '../utils/global-dtos/mailgun.dto'

export enum MailgunConfigVariableType {
  PARAMETER = 'PARAMETER',
  STRING = 'STRING',
  FEEDBACK_LINK = 'FEEDBACK_LINK',
}

type ParameterValueGetter = (
  data: SendEmailDataDto,
) => string | null | undefined

export type MailgunConfigVariable =
  | {
      type: MailgunConfigVariableType.PARAMETER
      getValue: ParameterValueGetter
    }
  | { type: MailgunConfigVariableType.STRING; value: string }
  | { type: MailgunConfigVariableType.FEEDBACK_LINK }

export interface MailgunConfig {
  template: string
  subject: string
  renderLocally?: boolean
  variables: Partial<Record<keyof SendEmailVariablesDto, MailgunConfigVariable>>
}

function parameterVariable(
  getValue: ParameterValueGetter,
): MailgunConfigVariable {
  return { type: MailgunConfigVariableType.PARAMETER, getValue }
}

function stringVariable(value: string): MailgunConfigVariable {
  return { type: MailgunConfigVariableType.STRING, value }
}

const applicationName = parameterVariable((data) => data.messageSubject)
const firstName = parameterVariable((data) => data.firstName)
const htmlData = parameterVariable((data) => data.htmlData)
const formSentAt = parameterVariable((data) => data.formSentAt?.toString())
const feedbackLink: MailgunConfigVariable = {
  type: MailgunConfigVariableType.FEEDBACK_LINK,
}

export function getMailgunConfig(
  baConfigService: BaConfigService,
): Record<MailgunTemplateEnum, MailgunConfig> {
  const feHost = stringVariable(baConfigService.frontend.url)

  return {
    [MailgunTemplateEnum.GINIS_SENT]: {
      template: '2023-application-status-sent',
      subject: 'Bratislavské konto: Vaša žiadosť bola odoslaná',
      variables: { applicationName, firstName, feHost, feedbackLink },
    },
    [MailgunTemplateEnum.GINIS_DELIVERED]: {
      template: '2023-application-status-delivered',
      subject: 'Bratislavské konto: Vaša žiadosť bola doručená',
      variables: { applicationName, firstName, feHost, feedbackLink },
    },
    [MailgunTemplateEnum.GINIS_IN_PROGRESS]: {
      template: '2023-application-status-in-progress',
      subject: 'Bratislavské konto: Na odoslaní Vašej žiadosti pracujeme',
      variables: { applicationName, firstName, feHost },
    },
    [MailgunTemplateEnum.GINIS_SUCCESS]: {
      template: '2023-application-status-success',
      subject: 'Bratislavské konto: Vaša žiadosť bola vybavená',
      variables: { applicationName, firstName, feHost, feedbackLink },
    },
    [MailgunTemplateEnum.GINIS_DENIED]: {
      template: '2023-application-status-denied',
      subject: 'Bratislavské konto: Vaša žiadosť bola zamietnutá',
      variables: { applicationName, firstName, feHost, feedbackLink },
    },
    [MailgunTemplateEnum.ATTACHMENT_VIRUS]: {
      template: '2023-application-status-virus',
      subject: 'Bratislavské konto: Vo Vašej žiadosti sa nachádza vírus',
      variables: {
        applicationName,
        firstName,
        feHost,
        slug: parameterVariable(
          (data) =>
            `${baConfigService.frontend.url}/${data.slug}/${data.formId}`,
        ),
      },
    },
    [MailgunTemplateEnum.OLO_NEW_SUBMISSION]: {
      template: 'olo-form-send',
      subject: 'OLO: Nové podanie',
      variables: { applicationName, htmlData },
    },
    [MailgunTemplateEnum.OLO_SENT_SUCCESS]: {
      template: '2024-olo-form-success',
      subject: 'OLO: Vaša žiadosť bola odoslaná',
      variables: {
        applicationName,
        feHost: stringVariable(baConfigService.olo.frontendUrl),
        firstName,
      },
    },
    [MailgunTemplateEnum.TSB_NEW_SUBMISSION]: {
      template: 'tsb-form-send',
      subject: 'TSB: Nové podanie',
      renderLocally: true,
      variables: { slug: parameterVariable((data) => data.slug), htmlData },
    },
    [MailgunTemplateEnum.TSB_ORDER_SENT_SUCCESS]: {
      template: '2025-tsb-form-success',
      subject: 'TSB: Vaša objednávka bola odoslaná',
      variables: { applicationName, firstName, feedbackLink },
    },
    [MailgunTemplateEnum.TSB_REQUEST_SENT_SUCCESS]: {
      template: '2025-tsb-form-success',
      subject: 'TSB: Vaša žiadosť bola odoslaná',
      variables: { applicationName, firstName, feedbackLink },
    },
    [MailgunTemplateEnum.BRATISLAVA_NEW_SUBMISSION]: {
      template: '2026-bratislava-new-submission',
      subject: 'Bratislavské konto: Nové podanie',
      variables: { applicationName, htmlData, formSentAt },
    },
    [MailgunTemplateEnum.BRATISLAVA_SENT_SUCCESS]: {
      template: '2026-bratislava-form-success',
      subject: 'Bratislavské konto: Vaša žiadosť bola odoslaná',
      variables: { applicationName, feHost, firstName, formSentAt },
    },
    [MailgunTemplateEnum.PAAS_CONTACT_FORM_SENT_SUCCESS]: {
      template: '2026-city-account-paas-contact-form-success',
      subject: 'PAAS: Vaša požiadavka bola odoslaná',
      variables: { applicationName, feHost, firstName, formSentAt },
    },
  }
}
