import { formsClient } from '@clients/forms'
import MyApplicationDetails from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationDetails'
import PageLayout from 'components/layouts/PageLayout'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { modifyGinisDataForSchemaSlug } from 'frontend/utils/ginis'
import logger from 'frontend/utils/logger'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

import { patchApplicationFormIfNeeded } from '../../components/forms/segments/AccountSections/MyApplicationsSection/patchApplicationFormIfNeededClient'
import { getEmailFormSlugs } from '../../components/forms/segments/AccountSections/MyApplicationsSection/patchApplicationFormIfNeededServer'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountMyApplicationsPageProps = {
  formDefinitionTitle: string
  myApplicationDetailsData: GetFormResponseDto
  myApplicationGinisData: GinisDocumentDetailResponseDto | null
}

export const getServerSideProps = amplifyGetServerSideProps<AccountMyApplicationsPageProps>(
  async ({ context, fetchAuthSession }) => {
    const id = context.query.ziadost as string

    if (!id) return { notFound: true }

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
