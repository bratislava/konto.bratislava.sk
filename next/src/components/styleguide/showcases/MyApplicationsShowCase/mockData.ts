import { QueryClient } from '@tanstack/react-query'
import {
  GetFormResponseDto,
  GetFormResponseDtoErrorEnum,
  GetFormResponseDtoStateEnum,
  GetFormResponseSimpleDto,
  GetFormsResponseDto,
  GinisDocumentDetailResponseDto,
} from 'openapi-clients/forms'

import { SelectOption } from '@/src/components/widget-components/SelectField/SelectField'
import { ApplicationsListVariant } from '@/src/pages/moje-ziadosti'

// ─── Shared showcase data ───

const MOCK_FORM_SLUG = 'zavazne-stanovisko-k-investicnej-cinnosti'
const MOCK_FORM_CATEGORY = 'Záväzné stanovisko k investičnej činnosti'

export const formDefinitionSlugTitleMap: Record<string, string> = {
  [MOCK_FORM_SLUG]: MOCK_FORM_CATEGORY,
}

export const emailFormSlugs: string[] = []

// ─── List page (MyApplicationsPageContent) ───

export const sectionOptions: SelectOption[] = [
  { value: 'SENT', label: 'SENT' },
  { value: 'SENDING', label: 'SENDING' },
  { value: 'DRAFT', label: 'DRAFT' },
]

export type ListScenario = 'withItems' | 'empty'

export const listScenarioOptions: SelectOption[] = [
  { value: 'withItems', label: 'With applications' },
  { value: 'empty', label: 'No applications found' },
]

type SimpleItemDraft = {
  state: GetFormResponseDtoStateEnum
  error: GetFormResponseDtoErrorEnum
  subject: string
}

// Representative items per section, covering the states the section can display.
const sectionItemDrafts: Record<ApplicationsListVariant, SimpleItemDraft[]> = {
  SENT: [
    {
      state: GetFormResponseDtoStateEnum.DeliveredNases,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Odoslané – doručené do NASES',
    },
    {
      state: GetFormResponseDtoStateEnum.DeliveredGinis,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Odoslané – doručené do GINIS',
    },
    {
      state: GetFormResponseDtoStateEnum.Processing,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Spracováva sa na úrade',
    },
    {
      state: GetFormResponseDtoStateEnum.Finished,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Vybavené',
    },
    {
      state: GetFormResponseDtoStateEnum.Rejected,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Zamietnuté',
    },
  ],
  SENDING: [
    {
      state: GetFormResponseDtoStateEnum.Queued,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Prebieha kontrola na vírusy',
    },
    {
      state: GetFormResponseDtoStateEnum.Error,
      error: GetFormResponseDtoErrorEnum.InfectedFiles,
      subject: 'Chyba – infikované súbory',
    },
    {
      state: GetFormResponseDtoStateEnum.Error,
      error: GetFormResponseDtoErrorEnum.NasesSendError,
      subject: 'Chyba – odoslanie zlyhalo',
    },
  ],
  DRAFT: [
    {
      state: GetFormResponseDtoStateEnum.Draft,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Rozpracovaný koncept',
    },
    {
      state: GetFormResponseDtoStateEnum.Draft,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Ďalší rozpracovaný koncept',
    },
  ],
}

const createSimpleItem = (draft: SimpleItemDraft, index: number): GetFormResponseSimpleDto => ({
  id: `mock-application-${index}`,
  createdAt: '2024-04-15T08:48:15.346Z',
  updatedAt: '2024-04-18T10:12:22.121Z',
  state: draft.state,
  error: draft.error,
  formDataJson: { mestoPSCstep: { mestoPSC: { mesto: 'Bratislava' } } },
  formSubject: draft.subject,
  formDefinitionSlug: MOCK_FORM_SLUG,
})

export const createMockApplications = (
  section: ApplicationsListVariant,
  scenario: ListScenario,
): GetFormsResponseDto => {
  const items =
    scenario === 'empty'
      ? []
      : sectionItemDrafts[section].map((draft, i) => createSimpleItem(draft, i))

  return {
    currentPage: 1,
    pagination: 10,
    countPages: 1,
    items,
    meta: { countByState: {} },
  }
}

// QueryClient seeded with the section counts (used by useTotalCount in the tab labels).
// staleTime: Infinity keeps the seeded data fresh so the real API is never called.
export const createMockQueryClient = (
  applications: GetFormsResponseDto,
  section: ApplicationsListVariant,
): QueryClient => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })

  const counts: Record<ApplicationsListVariant, number> = {
    SENT: 12,
    SENDING: 2,
    DRAFT: 3,
  }
  // Reflect the currently shown section's real item count.
  counts[section] = applications.items.length
  ;(['SENT', 'SENDING', 'DRAFT'] as const).forEach((variant) => {
    queryClient.setQueryData([`ApplicationsCount_${variant}`, variant], counts[variant])
  })

  return queryClient
}

// ─── Detail page (MyApplicationDetails) ───

export const detailStateOptions: SelectOption[] = [
  // { value: GetFormResponseDtoStateEnum.DeliveredNases, label: 'DELIVERED_NASES — doručené' },
  // { value: GetFormResponseDtoStateEnum.DeliveredGinis, label: 'DELIVERED_GINIS — odosiela sa' },
  // { value: GetFormResponseDtoStateEnum.Processing, label: 'PROCESSING — spracováva sa' },
  // { value: GetFormResponseDtoStateEnum.Finished, label: 'FINISHED — vybavené' },
  // { value: GetFormResponseDtoStateEnum.Rejected, label: 'REJECTED — zamietnuté' },
  {
    value: GetFormResponseDtoStateEnum.DeliveredNases,
    label: GetFormResponseDtoStateEnum.DeliveredNases,
  },
  {
    value: GetFormResponseDtoStateEnum.DeliveredGinis,
    label: GetFormResponseDtoStateEnum.DeliveredGinis,
  },
  { value: GetFormResponseDtoStateEnum.Processing, label: GetFormResponseDtoStateEnum.Processing },
  { value: GetFormResponseDtoStateEnum.Finished, label: GetFormResponseDtoStateEnum.Finished },
  { value: GetFormResponseDtoStateEnum.Rejected, label: GetFormResponseDtoStateEnum.Rejected },
]

export const MOCK_FORM_DEFINITION_TITLE = MOCK_FORM_CATEGORY

export const createMockDetailData = (state: GetFormResponseDtoStateEnum): GetFormResponseDto => ({
  email: 'test@example.com',
  id: 'mock-application-detail',
  createdAt: '2024-04-15T08:48:15.346Z',
  updatedAt: '2024-04-18T10:12:22.121Z',
  externalId: 'MAG00A1B2C3',
  userExternalId: 'mock-user-external-id',
  mainUri: null,
  actorUri: null,
  state,
  error: GetFormResponseDtoErrorEnum.None,
  formDataGinis: null,
  ginisDocumentId: 'MAG-DEN-2024-0001',
  formDataJson: { mestoPSCstep: { mestoPSC: { mesto: 'Bratislava' } } },
  senderId: null,
  recipientId: null,
  finishSubmission: null,
  formDefinitionSlug: MOCK_FORM_SLUG,
  jsonVersion: '1.0.0',
  formSubject: 'Záväzné stanovisko – Vymyslená 1',
  requiresMigration: false,
})

export const createMockGinisData = (): GinisDocumentDetailResponseDto => {
  return {
    id: 'MAG-DEN-2024-0001',
    dossierId: 'MAG-SPIS-2024-1234',
    ownerName: 'Jana Referentová',
    ownerEmail: 'jana.referentova@bratislava.sk',
    ownerPhone: '+421 900 000 000',
    documentHistory: [
      {
        'Id-dokumentu': 'MAG-DEN-2024-0001',
        'Datum-zmeny': '2024-04-18T10:12:22.121Z',
        'Id-zmenu-provedl': 'ref-001',
        'Id-ktg-zmeny': 'cat-001',
        assignedCategory: 'DOCUMENT_CREATED',
      },
      {
        'Id-dokumentu': 'MAG-DEN-2024-0001',
        'Datum-zmeny': '2024-04-15T08:48:15.346Z',
        'Id-zmenu-provedl': 'ref-002',
        'Id-ktg-zmeny': 'cat-001',
        assignedCategory: 'DOCUMENT_CREATED',
      },
    ],
  }
}
