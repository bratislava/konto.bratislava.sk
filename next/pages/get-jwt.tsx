// this is non-production code
// disabling eslint/ts checks instead of fixing them
// @ts-nocheck
import { getUserApi, resetRcApi } from '@utils/api'
import { ROUTES } from '@utils/constants'
import { AsyncServerProps } from '@utils/types'
import useAccount from '@utils/useAccount'
import Button from 'components/forms/simple-components/Button'
import PageWrapper from 'components/layouts/PageWrapper'
import { Wrapper } from 'components/styleguide/Wrapper'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

const signUpParams = [
  'test@mail.com',
  'Qwert12345!',
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
        const user = await getUserApi(token)
        console.log(user)
      }
    })().catch((error) => {
      console.log(error)
    })
  })

  const resetRc = async () => {
    try {
      await resetRcApi(accessToken)
      const res = await updateUserData({ tier: null })
      alert(`Res: ${res}`)
    } catch (error) {
      console.log(error)
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
