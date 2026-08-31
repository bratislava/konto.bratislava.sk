import { GetFormResponseDtoStateEnum } from 'openapi-clients/forms'

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
 */
const formResponseStatesByMyApplicationState: Record<
  MyApplicationState,
  GetFormResponseDtoStateEnum[]
> = {
  SENT: [
    'QUEUED',
    'ERROR',
    'REJECTED',
    'FINISHED',
    'PROCESSING',
    'DELIVERED_NASES',
    'DELIVERED_GINIS',
  ],
  DRAFT: ['DRAFT'],
}

export const getFormResponseStatesByMyApplicationState = (
  myApplicationState: MyApplicationStateFilter,
): GetFormResponseDtoStateEnum[] =>
  myApplicationState === 'ALL'
    ? MY_APPLICATION_STATES.flatMap((state) => formResponseStatesByMyApplicationState[state])
    : formResponseStatesByMyApplicationState[myApplicationState]

export const getMyApplicationStateByFormResponseState = (
  formResponseState: GetFormResponseDtoStateEnum,
): MyApplicationState =>
  MY_APPLICATION_STATES.find((myApplicationState) =>
    formResponseStatesByMyApplicationState[myApplicationState].includes(formResponseState),
  ) ?? 'SENT'
