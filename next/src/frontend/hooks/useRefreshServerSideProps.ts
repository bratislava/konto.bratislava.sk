import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// based on https://www.joshwcomeau.com/nextjs/refreshing-server-side-props/
// argument used only if watching 'refreshing' prop to trigger loading state - can be anything from ssr props
export const useRefreshServerSideProps = (dataToWatch?: unknown) => {
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const refreshData = async () => {
    setRefreshing(true)
    return router.replace(router.asPath)
  }

  useEffect(() => {
    setRefreshing(false)
  }, [dataToWatch])

  return { refreshing, refreshData }
}
