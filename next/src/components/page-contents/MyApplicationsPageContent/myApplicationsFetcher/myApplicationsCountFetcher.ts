import { AuthSession } from 'aws-amplify/auth'

import { formsClient } from '@/src/clients/forms'
import {
  getFormResponseStatesByMyApplicationState,
  MY_APPLICATION_STATE_FILTERS,
  MyApplicationStateFilter,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationStates'

export const getMyApplicationsCountQueryKey = () => ['MyApplicationsCount']

/**
 * Returns the number of applications for each state displayed in the tabs.
 *
 * The backend counts the forms by state using the same filter as the list itself, so a single
 * request without any state filter provides the counts for all the tabs at once.
 */
export const myApplicationsCountFetcher = async (
  getSsrAuthSession?: () => Promise<AuthSession>,
): Promise<Record<MyApplicationStateFilter, number>> => {
  const response = await formsClient.formsControllerGetForms(
    // Only `meta.countByState` is used, so the smallest possible page is requested
    '1',
    '1',
    // Without a state filter the response counts the forms in all the states
    undefined,
    undefined,
    undefined,
    { authStrategy: 'authOnly', getSsrAuthSession },
  )

  const { countByState } = response.data.meta

  return Object.fromEntries(
    MY_APPLICATION_STATE_FILTERS.map((myApplicationState) => [
      myApplicationState,
      getFormResponseStatesByMyApplicationState(myApplicationState).reduce(
        (count, formState) => count + (countByState[formState] ?? 0),
        0,
      ),
    ]),
  ) as Record<MyApplicationStateFilter, number>
}
