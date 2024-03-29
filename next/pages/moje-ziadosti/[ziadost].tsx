import { formsApi } from '@clients/forms'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from '@clients/openapi-forms'
import MyApplicationDetails from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationDetails'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { modifyGinisDataForSchemaSlug } from 'frontend/utils/ginis'
import logger from 'frontend/utils/logger'

import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountMyApplicationsPageProps = {
  myApplicationDetailsData: GetFormResponseDto
  myApplicationGinisData: GinisDocumentDetailResponseDto | null
}

export const getServerSideProps = amplifyGetServerSideProps<AccountMyApplicationsPageProps>(
  async ({ context, getAccessToken }) => {
    const id = context.query.ziadost as string

    if (!id) return { notFound: true }

    let myApplicationDetailsData: GetFormResponseDto | null = null
    let myApplicationGinisData: GinisDocumentDetailResponseDto | null = null
    try {
      const response = await formsApi.nasesControllerGetForm(id, {
        accessToken: 'always',
        accessTokenSsrGetFn: getAccessToken,
      })
      myApplicationDetailsData = response?.data // getApplicationDetailsData(ctx.query.ziadost) || null
      if (myApplicationDetailsData.ginisDocumentId) {
        const ginisRequest = await formsApi.ginisControllerGetGinisDocumentByFormId(id, {
          accessToken: 'always',
          accessTokenSsrGetFn: getAccessToken,
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
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const AccountMyApplicationsPage = ({
  myApplicationDetailsData,
  myApplicationGinisData,
}: AccountMyApplicationsPageProps) => {
  return (
    <AccountPageLayout>
      <MyApplicationDetails
        ginisData={myApplicationGinisData}
        detailsData={myApplicationDetailsData}
      />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountMyApplicationsPage)
