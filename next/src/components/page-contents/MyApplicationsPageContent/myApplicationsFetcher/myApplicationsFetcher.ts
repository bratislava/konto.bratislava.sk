import { AuthSession } from 'aws-amplify/auth'
import { GetFormsResponseDto } from 'openapi-clients/forms'

import { formsClient } from '@/src/clients/forms'
import {
  getFormResponseStatesByMyApplicationState,
  MyApplicationStateFilter,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationStates'

export type MyApplicationsFilters = {
  myApplicationState: MyApplicationStateFilter
  page: number
  pageSize: number
}

export const myApplicationsDefaultFilters: MyApplicationsFilters = {
  myApplicationState: 'ALL',
  page: 1,
  pageSize: 10,
}

/**
 * Fills in the defaults for the filters that are not part of the query state. Both the page content
 * and the SSR prefetch must build the filters this way, so they share the same query key.
 */
export const getMyApplicationsFilters = (
  filters: Pick<MyApplicationsFilters, 'myApplicationState' | 'page'>,
): MyApplicationsFilters => ({
  ...myApplicationsDefaultFilters,
  ...filters,
})

export const getMyApplicationsQueryKey = (filters: MyApplicationsFilters) => [
  'MyApplications',
  filters,
]

export const myApplicationsFetcher = async (
  filters: MyApplicationsFilters,
  getSsrAuthSession?: () => Promise<AuthSession>,
): Promise<GetFormsResponseDto> => {
  const formStatesToFetch = getFormResponseStatesByMyApplicationState(filters.myApplicationState)

  const response = await formsClient.formsControllerGetForms(
    // must be strings due to typing
    filters.page.toString(),
    filters.pageSize.toString(),
    formStatesToFetch,
    // TODO update when backend behaviour changes
    // if this is set formStatesToFetch would be ignored
    // and that does not match the required functionality in any of the tabs
    undefined,
    undefined,
    { authStrategy: 'authOnly', getSsrAuthSession },
  )

  return response.data
}
