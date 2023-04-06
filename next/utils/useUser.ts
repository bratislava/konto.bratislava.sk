import { Gdpr, getUserApi, subscribeApi, UNAUTHORIZED_ERROR_TEXT, unsubscribeApi } from '@utils/api'
import useAccount from '@utils/useAccount'
import { useEffect, useState } from 'react'

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
  useEffect(() => {
    const init = async () => {
      const token = await getAccessToken()
      try {
        const user = await getUserApi(token)
        setUser(user)
      } catch (error) {
        logger.error(error)
        // TODO temporary, pass better errors out of api requests
        if (error?.message === UNAUTHORIZED_ERROR_TEXT) {
          forceLogout()
        }
      }
    }

    init()
  }, [])

  const subscribe = async (): Promise<boolean> => {
    const token = await getAccessToken()
    try {
      const user = await subscribeApi({ gdprData: null }, token)
      setUser(user)
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

  const unsubscribe = async (): Promise<boolean> => {
    const token = await getAccessToken()
    try {
      const user = await unsubscribeApi({ gdprData: null }, token)
      setUser(user)
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
