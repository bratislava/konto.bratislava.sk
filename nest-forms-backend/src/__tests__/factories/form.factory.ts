import { FormError, Forms, FormState, GinisState } from '@prisma/client'

import { FormWithFiles } from '../../utils/types/prisma'

const DEFAULT_DATE = new Date('2024-01-01T00:00:00.000Z')

const baseForm = {
  id: '00000000-0000-4000-8000-000000000001',
  createdAt: DEFAULT_DATE,
  updatedAt: DEFAULT_DATE,
  externalId: null,
  userExternalId: null,
  cognitoGuestIdentityId: null,
  email: null,
  mainUri: null,
  actorUri: null,
  ownerType: null,
  ico: null,
  state: FormState.DRAFT,
  error: FormError.NONE,
  jsonVersion: '1.0',
  formDataJson: null,
  formDataGinis: null,
  formSignature: null,
  ginisDocumentId: null,
  senderId: null,
  recipientId: null,
  finishSubmission: null,
  formDefinitionSlug: 'test-form',
  formSummary: null,
  archived: false,
  ginisState: GinisState.CREATED,
  formSentAt: null,
}

export const createTestForm = (overrides?: Partial<Forms>): Forms => ({
  ...baseForm,
  ...overrides,
})

export const createTestFormWithFiles = (
  overrides?: Partial<FormWithFiles>,
): FormWithFiles => ({
  ...baseForm,
  files: [],
  ...overrides,
})
