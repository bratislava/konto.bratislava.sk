import { FormState } from 'openapi-clients/forms'

export const MY_APPLICATION_STATES = ['SENT', 'DRAFT'] as const
export type MyApplicationState = (typeof MY_APPLICATION_STATES)[number]

/**
 * The states the user can filter by, 'ALL' combines all the states above.
 */
export const MY_APPLICATION_STATE_FILTERS = ['ALL', ...MY_APPLICATION_STATES] as const
export type MyApplicationStateFilter = (typeof MY_APPLICATION_STATE_FILTERS)[number]

/**
 * On frontend, the user sees only two states 'sent' and 'draft'
 * This is a product decision to simplify the user experience
 *
 * It matches the backend split into `GetFormResponseSimpleDraftDto` and `GetFormResponseSimpleSentDto`,
 * where every state other than DRAFT (including ERROR) is considered sent and has `formSentAt` set.
 */
export const getMyApplicationStateByFormResponseState = (state: FormState): MyApplicationState =>
  state === FormState.Draft ? 'DRAFT' : 'SENT'

export const getFormResponseStatesByMyApplicationState = (
  filter: MyApplicationStateFilter,
): FormState[] =>
  Object.values(FormState).filter(
    (state) => filter === 'ALL' || getMyApplicationStateByFormResponseState(state) === filter,
  )
