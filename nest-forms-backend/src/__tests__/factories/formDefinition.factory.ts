import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'
import {
  FormDefinitionEmail,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionSlovenskoSkTax,
  FormDefinitionType,
  FormDefinitionWebhook,
} from 'forms-shared/definitions/formDefinitionTypes'
import { FormSendPolicy } from 'forms-shared/send-policy/sendPolicy'

const baseDefaults = {
  slug: 'test-form',
  title: 'Test Form',
  schema: {},
  jsonVersion: '1.0',
  sendPolicy: FormSendPolicy.AuthenticatedVerified,
  termsAndConditions: 'https://example.com/terms',
}

const slovenskoSkBaseDefaults = {
  ...baseDefaults,
  pospID: 'test.pospId',
  pospVersion: '1.0',
  publisher: 'Mesto Bratislava',
  isSigned: false,
}

export const createTestFormDefinitionSlovenskoSkGeneric = (
  overrides?: Partial<FormDefinitionSlovenskoSkGeneric>,
): FormDefinitionSlovenskoSkGeneric => ({
  ...slovenskoSkBaseDefaults,
  type: FormDefinitionType.SlovenskoSkGeneric,
  ginisDocumentTypeId: 'test-ginis-doc-type-id',
  ginisAssignment: { ginisNodeId: 'test-ginis-node-id' },
  ...overrides,
})

export const createTestFormDefinitionSlovenskoSkTax = (
  overrides?: Partial<FormDefinitionSlovenskoSkTax>,
): FormDefinitionSlovenskoSkTax => ({
  ...slovenskoSkBaseDefaults,
  type: FormDefinitionType.SlovenskoSkTax,
  ...overrides,
})

export const createTestFormDefinitionEmail = (
  overrides?: Partial<FormDefinitionEmail>,
): FormDefinitionEmail => ({
  ...baseDefaults,
  type: FormDefinitionType.Email,
  email: {
    mailer: 'mailgun',
    address: {
      test: ['test@bratislava.sk'],
      prod: ['prod@bratislava.sk'],
    },
    fromAddress: {
      test: 'noreply@test.bratislava.sk',
      prod: 'noreply@bratislava.sk',
    },
    newSubmissionTemplate: MailgunTemplateEnum.BRATISLAVA_NEW_SUBMISSION,
    userResponseTemplate: MailgunTemplateEnum.BRATISLAVA_SENT_SUCCESS,
  },
  ...overrides,
})

export const createTestFormDefinitionWebhook = (
  overrides?: Partial<FormDefinitionWebhook>,
): FormDefinitionWebhook => ({
  ...baseDefaults,
  type: FormDefinitionType.Webhook,
  webhookUrl: 'https://webhook.example.com/submit',
  ...overrides,
})
