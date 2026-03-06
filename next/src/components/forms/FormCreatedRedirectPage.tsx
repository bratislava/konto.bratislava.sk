import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export type FormCreatedRedirectPageProps = {
  redirectUrl: string
}

const FormCreatedRedirectPage = ({ redirectUrl }: FormCreatedRedirectPageProps) => {
  const router = useRouter()

  useEffect(() => {
    router.push(redirectUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default FormCreatedRedirectPage
