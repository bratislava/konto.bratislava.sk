import { formsApi } from '@clients/forms'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from '@clients/openapi-forms'
import MyApplicationDetails from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationDetails'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { modifyGinisDataForSchemaSlug } from 'frontend/utils/ginis'
import logger from 'frontend/utils/logger'
import { AsyncServerProps } from 'frontend/utils/types'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'
  const id = ctx.query.ziadost as string

  // const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)

  if (!id) return { notFound: true }

  let myApplicationDetailsData: GetFormResponseDto | null = null
  let myApplicationGinisData: GinisDocumentDetailResponseDto | null = null
  try {
    const response = await formsApi.nasesControllerGetForm(id, {
      accessToken: 'always',
      accessTokenSsrReq: ctx.req,
    })
    myApplicationDetailsData = response?.data // getApplicationDetailsData(ctx.query.ziadost) || null
    if (myApplicationDetailsData.ginisDocumentId) {
      const ginisRequest = await formsApi.ginisControllerGetGinisDocumentByFormId(id, {
        accessToken: 'always',
        accessTokenSsrReq: ctx.req,
      })
      myApplicationGinisData = ginisRequest?.data
    }
  } catch (error) {
    logger.error(error)
    return { notFound: true }
  }

  if (!myApplicationDetailsData) return { notFound: true }

  return {
    props: {
      myApplicationDetailsData,
      myApplicationGinisData: modifyGinisDataForSchemaSlug(
        myApplicationGinisData,
        myApplicationDetailsData.schemaVersion.schema?.slug,
      ),
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),

      ...(await serverSideTranslations(locale)),
    },
  }
}

const AccountMyApplicationsPage = ({
  myApplicationDetailsData,
  myApplicationGinisData,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <AccountPageLayout>
      <MyApplicationDetails
        ginisData={myApplicationGinisData}
        detailsData={myApplicationDetailsData}
      />
    </AccountPageLayout>
  )
}

export default ServerSideAuthProviderHOC(AccountMyApplicationsPage)
