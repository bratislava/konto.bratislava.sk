import Button from 'components/forms/simple-components/Button'
import PageWrapper from 'components/layouts/PageWrapper'
import { Wrapper } from 'components/styleguide/Wrapper'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { resetRcApi } from '../frontend/api/api'
import { ROUTES } from '../frontend/api/constants'
import useAccount, { UserData } from '../frontend/hooks/useAccount'
import logger from '../frontend/utils/logger'
import { AsyncServerProps } from '../frontend/utils/types'

const signUpParams: [string, string, boolean, string, UserData] = [
  'test@mail.com',
  'Qwert12345!',
  true,
  '',
  {
    given_name: 'Test',
    family_name: 'Test',
  },
]

const GetJwt = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { getAccessToken, isAuth, updateUserData, logout, signUp } = useAccount()
  const [accessToken, setAccessToken] = useState('')

  useEffectOnce(() => {
    ;(async () => {
      const token = await getAccessToken()
      if (token) {
        setAccessToken(token)
      }
    })().catch((error) => {
      logger.error(error)
    })
  })

  const resetRc = async () => {
    try {
      await resetRcApi(accessToken)
      const res = await updateUserData({ tier: undefined })
      alert(`Res: ${JSON.stringify(res)}`)
    } catch (error) {
      logger.error(error)
      alert(`ERROR`)
    }
  }

  return (
    <PageWrapper locale={page.locale}>
      <div className="min-h-screen bg-[#E5E5E5]">
        <div className="mx-auto max-w-screen-lg md:px-12 md:pt-12 pb-64">
          <Wrapper
            direction="column"
            title="Below you can see the access token of currently logged-in user"
          >
            {isAuth ? (
              <div className="flex flex-col">
                <div>{accessToken}</div>
                <Button onPress={resetRc} text="Reset RC" />
                <Button onPress={logout} text="Logout" />
              </div>
            ) : (
              <div className="flex flex-col">
                <Button href={ROUTES.LOGIN} label="No user - go to login" variant="link-category" />
                <Button onPress={logout} text="Logout" />
                <Button
                  onPress={() => signUp(...signUpParams)}
                  text="SignUp - change hardcoded params in code"
                />
              </div>
            )}
          </Wrapper>
        </div>
      </div>
    </PageWrapper>
  )
}

// TODO hide in production-production
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // if (isProductionDeployment()) return { notFound: true }

  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      page: {
        locale: ctx.locale,
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

export default GetJwt
