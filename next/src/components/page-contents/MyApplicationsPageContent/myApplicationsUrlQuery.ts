import { createLoader, parseAsInteger, parseAsString, SearchParams } from 'nuqs/server'

import {
  MY_APPLICATION_STATE_FILTERS,
  MyApplicationStateFilter,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationStates'

export const slugByMyApplicationStateFilter: Record<MyApplicationStateFilter, string> = {
  ALL: 'vsetky',
  SENT: 'odoslane',
  DRAFT: 'koncepty',
}

const myApplicationStateFilterBySlug = Object.fromEntries(
  MY_APPLICATION_STATE_FILTERS.map((filter) => [slugByMyApplicationStateFilter[filter], filter]),
) as Record<string, MyApplicationStateFilter | undefined>

/**
 * The params and `parseMyApplicationsFiltersFromUrlQuery` are shared by `useMyApplicationsFilters`
 * and by `parseMyApplicationsFiltersFromServerUrlQuery`, so the client and the server always derive
 * the same values from the URL - otherwise the data prefetched in `getServerSideProps` wouldn't
 * match the query keys used on the client.
 */
export const myApplicationsUrlQueryParams = {
  stav: parseAsString.withDefault(slugByMyApplicationStateFilter.ALL),
  strana: parseAsInteger.withDefault(1),
}

export const parseMyApplicationsFiltersFromUrlQuery = ({
  stav,
  strana,
}: {
  stav: string
  strana: number
}) =>
  ({
    // A hand-edited URL can carry an unknown slug, such a section falls back to 'ALL'.
    selectedSection: myApplicationStateFilterBySlug[stav] ?? 'ALL',
    // A hand-edited URL can carry a nonsensical page, the API expects 1-based pages.
    currentPage: Math.max(strana, 1),
  }) as const

const loadSearchParams = createLoader(myApplicationsUrlQueryParams)

/**
 * Server-side counterpart of `useMyApplicationsFilters`.
 */
export const parseMyApplicationsFiltersFromServerUrlQuery = (query: SearchParams) =>
  parseMyApplicationsFiltersFromUrlQuery(loadSearchParams(query))
