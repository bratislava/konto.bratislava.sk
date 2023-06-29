import { useCallback, useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

// eslint-disable-next-line import/extensions
import { getUserApi, subscribeApi, UNAUTHORIZED_ERROR_TEXT, unsubscribeApi } from '../api/api'
import { Gdpr, GeneralError, User } from '../dtos/generalApiDto'
import logger from '../utils/logger'

export default function useUser() {
  const [user, setUser] = useState<User | undefined>()

  const init = useCallback(async () => {
    try {
      const loadedUser: User = await getUserApi()
      setUser(loadedUser)
    } catch (_error: unknown) {
      const error: GeneralError = _error as GeneralError
      logger.error(error)
      if (error?.message === UNAUTHORIZED_ERROR_TEXT) {
        // TODO logout
        logger.error('401 - user not logged in when updating consents')
      }
    }
  }, [])

  useEffectOnce(() => {
    init().catch((error_) => logger.error('Init error', error_))
  })

  const subscribe = async (data: Gdpr[]): Promise<boolean> => {
    try {
      const loadedUser: User = await subscribeApi({ gdprData: data })
      setUser(loadedUser)
      return true
    } catch (_error: unknown) {
      const error: GeneralError = _error as GeneralError
      logger.error(error)
      if (error?.message === UNAUTHORIZED_ERROR_TEXT) {
        // TODO logout
        logger.error('401 - user not logged in when updating consents')
      }
      return false
    }
  }

  const unsubscribe = async (data: Gdpr[]): Promise<boolean> => {
    try {
      const loadedUser: User = await unsubscribeApi({ gdprData: data })
      setUser(loadedUser)
      return true
    } catch (_error: unknown) {
      const error: GeneralError = _error as GeneralError
      logger.error(error)
      if (error?.message === UNAUTHORIZED_ERROR_TEXT) {
        // TODO logout
        logger.error('401 - user not logged in when updating consents')
      }

      return false
    }
  }

  return { data: user, unsubscribe, subscribe }
}
