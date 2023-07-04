import { useCallback, useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

// eslint-disable-next-line import/extensions
import { getUserApi, subscribeApi, unsubscribeApi } from '../api/api'
import { Gdpr, User } from '../dtos/generalApiDto'
import logger from '../utils/logger'

export default function useUser() {
  const [user, setUser] = useState<User | undefined>()

  const init = useCallback(async () => {
    try {
      const loadedUser: User = await getUserApi()
      setUser(loadedUser)
    } catch (error: unknown) {
      logger.error(error)
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
    } catch (error: unknown) {
      logger.error(error)
      return false
    }
  }

  const unsubscribe = async (data: Gdpr[]): Promise<boolean> => {
    try {
      const loadedUser: User = await unsubscribeApi({ gdprData: data })
      setUser(loadedUser)
      return true
    } catch (error: unknown) {
      logger.error(error)
      return false
    }
  }

  return { data: user, unsubscribe, subscribe }
}
