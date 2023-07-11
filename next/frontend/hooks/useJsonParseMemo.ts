import logger from 'frontend/utils/logger'
import { useMemo } from 'react'

// useful if you're getting json as a string in your component and don't want to tie it's parsing to each render or a pre-existing effect hook
export default <T>(stringToParse: string | undefined | null) =>
  useMemo<T | null>(() => {
    try {
      if (!stringToParse) return null
      return JSON.parse(stringToParse) as unknown as T
    } catch (error) {
      logger.error('Error parsing JSON: ', stringToParse, error)
    }
    return null
  }, [stringToParse])
