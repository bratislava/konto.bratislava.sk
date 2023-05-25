import Button from 'components/forms/simple-components/Button'
import PageWrapper from 'components/layouts/PageWrapper'
import { Wrapper } from 'components/styleguide/Wrapper'
import { isProductionDeployment } from 'frontend/utils/general'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import { resetRcApi } from '../frontend/api/api'
import { ROUTES } from '../frontend/api/constants'
import useAccount from '../frontend/hooks/useAccount'
import logger from '../frontend/utils/logger'
import { AsyncServerProps } from '../frontend/utils/types'

const GetJwt = ({ page }: AsyncServerProps<typeof getServerSideProps>) => {
  const { getAccessToken, isAuth, updateUserData, logout } = useAccount()
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
            title="Kód nižšie slúži na technické účeli a umožňuje prístup k Vášmu kontu. NIKDY HO S NIKÝM NEZDIEĽAJTE. This site is for development purposes, the code below allows anyone to access your account. NEVER SHARE IT WITH ANYONE."
          >
            {isAuth ? (
              <div className="flex flex-col">
                <div>{accessToken}</div>
                {!isProductionDeployment() ? (
                  <>
                    <Button onPress={resetRc} text="Reset RC" />
                    <Button onPress={logout} text="Logout" />
                  </>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col">
                <Button href={ROUTES.LOGIN} label="No user - go to login" variant="link-category" />
              </div>
            )}
          </Wrapper>
        </div>
      </div>
    </PageWrapper>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
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
