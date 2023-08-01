import Button from 'components/forms/simple-components/Button'
import PageWrapper from 'components/layouts/PageWrapper'
import {
  getSSRAccessToken,
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { Wrapper } from 'components/styleguide/Wrapper'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

// import { resetRcApi } from '../frontend/api/api'
import { ROUTES } from '../frontend/api/constants'
import { AsyncServerProps } from '../frontend/utils/types'

const GetJwt = ({ page, accessToken }: AsyncServerProps<typeof getServerSideProps>) => {
  // resetting the birth number was not used for some time - if needed, this needs to be updated
  // const resetRc = async () => {
  //   try {
  //     await resetRcApi()
  // reset the birth number in cognito data here!
  //     alert(`Res: ${JSON.stringify(res)}`)
  //   } catch (error) {
  //     logger.error(error)
  //     alert(`ERROR`)
  //   }
  // }

  const { isAuthenticated } = useServerSideAuth()

  return (
    <PageWrapper locale={page.locale}>
      <div className="min-h-screen bg-[#E5E5E5]">
        <div className="mx-auto max-w-screen-lg pb-64 md:px-12 md:pt-12">
          <Wrapper
            direction="column"
            title="Kód nižšie slúži na technické účeli a umožňuje prístup k Vášmu kontu. NIKDY HO S NIKÝM NEZDIEĽAJTE. This site is for development purposes, the code below allows anyone to access your account. NEVER SHARE IT WITH ANYONE."
          >
            {isAuthenticated ? (
              <div className="flex flex-col">
                <div>{accessToken}</div>
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
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),
      accessToken: await getSSRAccessToken(ctx.req),
      page: {
        locale: ctx.locale,
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

export default ServerSideAuthProviderHOC(GetJwt)
