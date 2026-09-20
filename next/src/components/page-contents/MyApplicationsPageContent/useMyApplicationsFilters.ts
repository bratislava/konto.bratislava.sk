import { useQueryStates } from 'nuqs'

import { MyApplicationStateFilter } from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationStates'
import {
  myApplicationsUrlQueryParams,
  parseMyApplicationsFiltersFromUrlQuery,
  slugByMyApplicationStateFilter,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsUrlQuery'
import logger from '@/src/frontend/utils/logger'

export const useMyApplicationsFilters = () => {
  const [queryState, setQueryState] = useQueryStates(myApplicationsUrlQueryParams, {
    history: 'replace',
  })

  const setSelectedMyApplicationState = (variant: MyApplicationStateFilter) => {
    setQueryState({ stav: slugByMyApplicationStateFilter[variant], strana: 1 }).catch((error) =>
      logger.error(error),
    )
  }

  const setPage = (page: number) => {
    setQueryState({ strana: page }).catch((error) => logger.error(error))
  }

  return {
    ...parseMyApplicationsFiltersFromUrlQuery(queryState),
    setSelectedMyApplicationState,
    setPage,
  } as const
}
