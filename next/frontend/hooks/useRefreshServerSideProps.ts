import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// based on https://www.joshwcomeau.com/nextjs/refreshing-server-side-props/
export const useRefreshServerSideProps = (dataToRefresh: unknown) => {
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const refreshData = async () => {
    setRefreshing(true)
    return router.replace(router.asPath)
  }

  useEffect(() => {
    setRefreshing(false)
  }, [dataToRefresh])

  return { refreshing, refreshData }
}
