import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

import { formsClient } from '@/src/clients/forms'
import PageLayout from '@/src/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import MyApplicationDetails from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationDetails'
import { patchApplicationFormIfNeeded } from '@/src/components/page-contents/MyApplicationsPageContent/patchApplicationFormIfNeededClient'
import { getEmailFormSlugs } from '@/src/components/page-contents/MyApplicationsPageContent/patchApplicationFormIfNeededServer'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { modifyGinisDataForSchemaSlug } from '@/src/frontend/utils/ginis'
import logger from '@/src/frontend/utils/logger'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type AccountMyApplicationsPageProps = {
  formDefinitionTitle: string
  myApplicationDetailsData: GetFormResponseDto
  myApplicationGinisData: GinisDocumentDetailResponseDto | null
}

export const getServerSideProps = amplifyGetServerSideProps<AccountMyApplicationsPageProps>(
  async ({ context, fetchAuthSession }) => {
    const id = context.query.ziadost as string

    if (!id) return { notFound: true }

    // eslint-disable-next-line no-useless-assignment
    let myApplicationDetailsData: GetFormResponseDto | null = null
    let myApplicationGinisData: GinisDocumentDetailResponseDto | null = null
    try {
      const response = await formsClient.nasesControllerGetForm(id, {
        authStrategy: 'authOnly',
        getSsrAuthSession: fetchAuthSession,
      })
      const emailFormSlugs = getEmailFormSlugs()
      myApplicationDetailsData = patchApplicationFormIfNeeded(response.data, emailFormSlugs)
      if (myApplicationDetailsData.ginisDocumentId) {
        const ginisRequest = await formsClient.ginisControllerGetGinisDocumentByFormId(id, {
          authStrategy: 'authOnly',
          getSsrAuthSession: fetchAuthSession,
        })
        myApplicationGinisData = ginisRequest?.data
      }
    } catch (error) {
      logger.error(error)
      return { notFound: true }
    }

    if (!myApplicationDetailsData) return { notFound: true }

    const formDefinition = getFormDefinitionBySlug(myApplicationDetailsData.formDefinitionSlug)
    if (!formDefinition) {
      return { notFound: true }
    }

    return {
      props: {
        formDefinitionTitle: formDefinition.title,
        myApplicationDetailsData,
        myApplicationGinisData: modifyGinisDataForSchemaSlug(
          myApplicationGinisData,
          myApplicationDetailsData.formDefinitionSlug,
        ),
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const AccountMyApplicationsPage = ({
  formDefinitionTitle,
  myApplicationDetailsData,
  myApplicationGinisData,
}: AccountMyApplicationsPageProps) => {
  return (
    <PageLayout>
      <MyApplicationDetails
        formDefinitionTitle={formDefinitionTitle}
        ginisData={myApplicationGinisData}
        detailsData={myApplicationDetailsData}
      />
    </PageLayout>
  )
}

export default SsrAuthProviderHOC(AccountMyApplicationsPage)
