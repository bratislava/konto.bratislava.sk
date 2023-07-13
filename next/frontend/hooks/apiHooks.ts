import { useQuery } from '@tanstack/react-query'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { useEffect } from 'react'

import { getTaxApi } from '../api/api'
import { ajvFormats, ajvKeywords } from '../dtos/formStepperDto'
import { TaxApiError } from '../dtos/generalApiDto'
import { Tax, TaxJSONSchema } from '../dtos/taxDto'
import logger from '../utils/logger'

// TODO test for no tax, not yet tax, legit tax unpaid, partially paid, paid
export const useTaxes = () => {
  // TODO handle 401 & token refreshing - for now, this should work reasonably as along as the page isn't opened for too long
  // TODO make sure log out -> log in as different user -> loading data does not load the data of previous user - without futher change it will now
  // TODO move towards react query
  const queryResult = useQuery<Tax>(['/api/taxes'], () => getTaxApi(), { retry: false })

  useEffect(() => {
    if (
      queryResult.error &&
      queryResult.error instanceof TaxApiError &&
      queryResult.error.status !== 422
    ) {
      logger.error('Error while fetching tax data', queryResult.error)
    }
  }, [queryResult.error])

  // validate data according to schema
  // if they don't look right, we still try to display them, but we'
  useEffect(() => {
    if (queryResult.data) {
      // todo use single ajv instance with multiple schemas, as per recommendations - https://ajv.js.org/guide/managing-schemas.html#compiling-during-initialization
      const ajv = new Ajv({
        keywords: ajvKeywords,
        formats: ajvFormats,
      })
      addFormats(ajv)

      const validate = ajv.compile(TaxJSONSchema)
      const result = validate(queryResult.data)
      if (!result) {
        logger.error('Tax data does not match expected schema', validate?.errors)
      }
    }
  }, [queryResult.data])
  return queryResult
}
