import { QueryClient } from '@tanstack/react-query'
import {
  FormState,
  GetFormResponseDto,
  GetFormResponseDtoErrorEnum,
  GetFormResponseDtoStateEnum,
  GetFormsResponseDto,
  GetFormsResponseDtoItemsInner,
  GinisDocumentDetailResponseDto,
} from 'openapi-clients/forms'

import { getMyApplicationsCountQueryKey } from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationsCountFetcher'
import {
  getMyApplicationsQueryKey,
  myApplicationsDefaultFilters,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationsFetcher'
import {
  getFormResponseStatesByMyApplicationState,
  MY_APPLICATION_STATE_FILTERS,
  MY_APPLICATION_STATES,
  MyApplicationState,
  MyApplicationStateFilter,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationStates'
import { SelectOption } from '@/src/components/widget-components/SelectField/SelectField'

// ─── Shared showcase data ───

const MOCK_FORM_SLUG = 'zavazne-stanovisko-k-investicnej-cinnosti'
const MOCK_FORM_CATEGORY = 'Záväzné stanovisko k investičnej činnosti'

export const formDefinitionSlugTitleMap: Record<string, string> = {
  [MOCK_FORM_SLUG]: MOCK_FORM_CATEGORY,
}

// ─── List page (MyApplicationsPageContent) ───

export const sectionOptions: SelectOption[] = MY_APPLICATION_STATE_FILTERS.map((filter) => ({
  value: filter,
  label: filter,
}))

export type ListScenario = 'withItems' | 'empty' | 'error'

export const listScenarioOptions: SelectOption[] = [
  { value: 'withItems', label: 'With applications' },
  { value: 'empty', label: 'No applications found' },
  { value: 'error', label: 'Failed to load (e.g. 500 from backend)' },
]

type SimpleItemDraft = {
  state: FormState
  error: GetFormResponseDtoErrorEnum
  subject: string
  // Drafts can have it set too, if a send attempt failed and the form reverted to DRAFT
  formSentAt?: string
}

// Representative items per section, covering the states the section can display.
const sectionItemDrafts: Record<MyApplicationState, SimpleItemDraft[]> = {
  SENT: [
    {
      state: FormState.DeliveredNases,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Odoslané – doručené do NASES',
    },
    {
      state: FormState.DeliveredGinis,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Odoslané – doručené do GINIS',
    },
    {
      state: FormState.Processing,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Spracováva sa na úrade',
    },
    {
      state: FormState.Finished,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Vybavené',
    },
    {
      state: FormState.Rejected,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Zamietnuté',
    },
    {
      state: FormState.Error,
      error: GetFormResponseDtoErrorEnum.NasesSendError,
      subject: 'Chyba pri spracovaní',
    },
  ],
  DRAFT: [
    {
      state: FormState.Draft,
      error: GetFormResponseDtoErrorEnum.None,
      subject: 'Rozpracovaný koncept',
    },
    {
      state: FormState.Draft,
      error: GetFormResponseDtoErrorEnum.InfectedFiles,
      subject: 'Koncept vrátený po neúspešnom odoslaní',
      formSentAt: '2024-04-17T09:30:00.000Z',
    },
  ],
}

const createSimpleItem = (draft: SimpleItemDraft, index: number): GetFormsResponseDtoItemsInner => {
  const base = {
    id: `mock-application-${index}`,
    createdAt: '2024-04-15T08:48:15.346Z',
    updatedAt: '2024-04-18T10:12:22.121Z',
    error: draft.error,
    formDataJson: { mestoPSCstep: { mestoPSC: { mesto: 'Bratislava' } } },
    formSubject: draft.subject,
    formDefinitionSlug: MOCK_FORM_SLUG,
  }

  return draft.state === FormState.Draft
    ? { ...base, state: FormState.Draft, formSentAt: draft.formSentAt ?? null }
    : {
        ...base,
        state: draft.state,
        formSentAt: draft.formSentAt ?? '2024-04-18T10:00:00.000Z',
      }
}

const getSectionItemDrafts = (section: MyApplicationStateFilter): SimpleItemDraft[] =>
  section === 'ALL'
    ? MY_APPLICATION_STATES.flatMap((state) => sectionItemDrafts[state])
    : sectionItemDrafts[section]

// Mirrors `meta.countByState` from the backend, which counts the forms in all the states
// regardless of the currently selected section.
const createCountByState = (scenario: ListScenario): Record<string, number> => {
  if (scenario !== 'withItems') {
    return {}
  }

  const countByState: Record<string, number> = {}
  getSectionItemDrafts('ALL').forEach((draft) => {
    countByState[draft.state] = (countByState[draft.state] ?? 0) + 1
  })

  return countByState
}

export const createMockApplications = (
  section: MyApplicationStateFilter,
  scenario: ListScenario,
): GetFormsResponseDto => {
  const items =
    scenario === 'withItems'
      ? getSectionItemDrafts(section).map((draft, i) => createSimpleItem(draft, i))
      : []

  return {
    currentPage: 1,
    pagination: 10,
    countPages: 1,
    items,
    meta: { countByState: createCountByState(scenario) },
  }
}

// QueryClient seeded with the list itself and the section counts shown in the tab labels.
// staleTime: Infinity keeps the seeded data fresh so the real API is never called.
export const createMockQueryClient = (
  applications: GetFormsResponseDto,
  section: MyApplicationStateFilter,
  scenario: ListScenario,
): QueryClient => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Keeps the seeded error state, otherwise the query would call the real API on mount
        retryOnMount: false,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })

  const listQueryKey = getMyApplicationsQueryKey({
    ...myApplicationsDefaultFilters,
    myApplicationState: section,
    page: 1,
  })

  if (scenario === 'error') {
    // Simulates both requests failing, e.g. backend throwing FORM_SENT_AT_MISSING_ERROR
    const error = new Error('Request failed with status code 500')
    ;[listQueryKey, getMyApplicationsCountQueryKey()].forEach((queryKey) => {
      const query = queryClient.getQueryCache().build(queryClient, { queryKey })
      query.setState({ ...query.state, status: 'error', error, errorUpdatedAt: Date.now() })
    })

    return queryClient
  }

  queryClient.setQueryData(listQueryKey, applications)

  // Derived from the mocked `meta.countByState` the same way `myApplicationsCountFetcher` does it,
  // so the tab counts always match the mocked items.
  const { countByState } = applications.meta
  const counts = Object.fromEntries(
    MY_APPLICATION_STATE_FILTERS.map((myApplicationState) => [
      myApplicationState,
      getFormResponseStatesByMyApplicationState(myApplicationState).reduce(
        (count, formState) => count + (countByState[formState] ?? 0),
        0,
      ),
    ]),
  ) as Record<MyApplicationStateFilter, number>
  queryClient.setQueryData(getMyApplicationsCountQueryKey(), counts)

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

export const createMockMyApplicationFormData = (
  state: GetFormResponseDtoStateEnum,
): GetFormResponseDto => ({
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

export const createMockMyApplicationGinisData = (): GinisDocumentDetailResponseDto => {
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
