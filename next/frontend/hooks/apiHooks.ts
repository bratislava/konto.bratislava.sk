import { ResponseTaxDto } from '@clients/openapi-tax'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { getTaxApi } from '../api/api'
import { TaxApiError } from '../dtos/generalApiDto'
import logger from '../utils/logger'

// TODO test for no tax, not yet tax, legit tax unpaid, partially paid, paid
export const useTaxes = () => {
  // TODO handle 401 & token refreshing - for now, this should work reasonably as along as the page isn't opened for too long
  // TODO make sure log out -> log in as different user -> loading data does not load the data of previous user - without futher change it will now
  // TODO move towards react query
  const queryResult = useQuery<ResponseTaxDto>({
    queryKey: ['/api/taxes'],
    queryFn: () => getTaxApi(),
    retry: false,
  })

  useEffect(() => {
    if (
      queryResult.error &&
      queryResult.error instanceof TaxApiError &&
      queryResult.error.status !== 422
    ) {
      logger.error('Error while fetching tax data', queryResult.error)
    }
  }, [queryResult.error])
  return queryResult
}
