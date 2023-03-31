import { Gdpr, getUserApi, subscribeApi, unsubscribeApi } from '@utils/api'
import useAccount from '@utils/useAccount'
import { useEffect, useState } from 'react'

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

  const { getAccessToken } = useAccount()
  useEffect(() => {
    const init = async () => {
      const token = await getAccessToken()
      try {
        const user = await getUserApi(token)
        setUser(user)
      } catch (error) {
        console.error(error)
      }
    }

    init()
  }, [])

  const subscribe = async () => {
    const token = await getAccessToken()
    try {
      const user = await subscribeApi({ gdprData: null }, token)
      setUser(user)
    } catch (error) {
      console.error(error)
    }
  }

  const unsubscribe = async () => {
    const token = await getAccessToken()
    try {
      const user = await unsubscribeApi({ gdprData: null }, token)
      setUser(user)
    } catch (error) {
      console.error(error)
    }
  }

  return { data: user, unsubscribe, subscribe }
}
