import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { useEffect } from 'react'
import useSWR from 'swr'

import { getTaxApi,TaxApiError } from '../api/api'
import { Tax, TaxJSONSchema } from '../dtos/taxDto'
import { ajvFormats, ajvKeywords } from '../forms'
import logger from '../utils/logger'
import useAccount from './useAccount'

// TODO test for no tax, not yet tax, legit tax unpaid, partially paid, paid
export const useTaxes = () => {
  const { lastAccessToken } = useAccount()
  // TODO handle 401 & token refreshing - for now, this should work reasonably as along as the page isn't opened for too long
  const swrResult = useSWR<Tax>(
    () => (lastAccessToken ? ['/api/taxes', lastAccessToken] : null),
    ([, token]: [void, string]) => getTaxApi(token),
    { shouldRetryOnError: false },
  )

  useEffect(() => {
    if (
      swrResult.error &&
      swrResult.error instanceof TaxApiError &&
      swrResult.error.status !== 422
    ) {
      logger.error('Error while fetching tax data', swrResult.error)
    }
  }, [swrResult.error])

  // validate data according to schema
  // if they don't look right, we still try to display them, but we'
  useEffect(() => {
    if (swrResult.data) {
      // todo use single ajv instance with multiple schemas, as per recommendations - https://ajv.js.org/guide/managing-schemas.html#compiling-during-initialization
      const ajv = new Ajv({
        keywords: ajvKeywords,
        formats: ajvFormats,
      })
      addFormats(ajv)

      const validate = ajv.compile(TaxJSONSchema)
      const result = validate(swrResult.data)
      if (!result) {
        logger.error('Tax data does not match expected schema', validate?.errors)
      }
    }
  }, [swrResult.data])
  return swrResult
}
