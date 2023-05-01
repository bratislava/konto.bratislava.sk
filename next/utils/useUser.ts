import { Gdpr, getUserApi, subscribeApi, UNAUTHORIZED_ERROR_TEXT, unsubscribeApi } from '@utils/api'
import useAccount from '@utils/useAccount'
import { useCallback, useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import logger from './logger'

export interface User {
  id: string
  createdAt: Date
  updatedAt: Date
  externalId?: string
  email: string
  birthNumber: string
  gdprData: Gdpr[]
}

export default function useUser() {
  const [user, setUser] = useState<User | undefined>()

  const { getAccessToken, forceLogout } = useAccount()

  const init = useCallback(async () => {
    const token = await getAccessToken()
    try {
      const loadedUser: User = await getUserApi(token)
      setUser(loadedUser)
    } catch (error) {
      logger.error(error)
      // TODO temporary, pass better errors out of api requests
      if (error?.message === UNAUTHORIZED_ERROR_TEXT) {
        forceLogout()
      }
    }
  }, [forceLogout, getAccessToken])

  useEffectOnce(() => {
    init().catch((error_) => logger.error('Init error', error_))
  })

  const subscribe = async (data: Gdpr[]): Promise<boolean> => {
    const token = await getAccessToken()
    try {
      const loadedUser: User = await subscribeApi({ gdprData: data }, token)
      setUser(loadedUser)
      return true
    } catch (error) {
      logger.error(error)
      // TODO temporary, pass better errors out of api requests
      if (error?.message === UNAUTHORIZED_ERROR_TEXT) {
        forceLogout()
      }
      return false
    }
  }

  const unsubscribe = async (data: Gdpr[]): Promise<boolean> => {
    const token = await getAccessToken()
    try {
      const loadedUser: User = await unsubscribeApi({ gdprData: data }, token)
      setUser(loadedUser)
      return true
    } catch (error) {
      logger.error(error)
      // TODO temporary, pass better errors out of api requests
      if (error?.message === UNAUTHORIZED_ERROR_TEXT) {
        forceLogout()
      }

      return false
    }
  }

  return { data: user, unsubscribe, subscribe }
}
