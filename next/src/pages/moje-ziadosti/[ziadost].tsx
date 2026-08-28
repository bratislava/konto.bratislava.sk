import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

import { formsClient } from '@/src/clients/forms'
import { strapiClient } from '@/src/clients/graphql-strapi'
import { GeneralQuery } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import MyApplicationDetails from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationDetails'
import { patchApplicationFormIfNeeded } from '@/src/components/page-contents/MyApplicationsPageContent/patchApplicationFormIfNeededClient'
import { getEmailFormSlugs } from '@/src/components/page-contents/MyApplicationsPageContent/patchApplicationFormIfNeededServer'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { modifyGinisDataForSchemaSlug } from '@/src/frontend/utils/ginis'
import logger from '@/src/frontend/utils/logger'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type Props = {
  general: GeneralQuery
  formDefinitionTitle: string
  myApplicationFormData: GetFormResponseDto
  myApplicationGinisData: GinisDocumentDetailResponseDto | null
}

export const getServerSideProps = amplifyGetServerSideProps<Props>(
  async ({ context, fetchAuthSession }) => {
    const id = context.query.ziadost as string

    if (!id) {
      return { notFound: true }
    }

    // eslint-disable-next-line no-useless-assignment
    let myApplicationFormData: GetFormResponseDto | null = null
    let myApplicationGinisData: GinisDocumentDetailResponseDto | null = null
    try {
      const response = await formsClient.formsControllerGetForm(id, {
        authStrategy: 'authOnly',
        getSsrAuthSession: fetchAuthSession,
      })

      const emailFormSlugs = getEmailFormSlugs()
      myApplicationFormData = patchApplicationFormIfNeeded(response.data, emailFormSlugs)

      if (myApplicationFormData.ginisDocumentId) {
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

    if (!myApplicationFormData) {
      return { notFound: true }
    }

    const formDefinition = getFormDefinitionBySlug(myApplicationFormData.formDefinitionSlug)
    if (!formDefinition) {
      return { notFound: true }
    }

    const general = await strapiClient.General()

    return {
      props: {
        general,
        formDefinitionTitle: formDefinition.title,
        myApplicationFormData,
        myApplicationGinisData: modifyGinisDataForSchemaSlug(
          myApplicationGinisData,
          myApplicationFormData.formDefinitionSlug,
        ),
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const AccountMyApplicationsPage = ({
  general,
  formDefinitionTitle,
  myApplicationFormData,
  myApplicationGinisData,
}: Props) => {
  return (
    <GeneralContextProvider general={general}>
      <PageLayout>
        <MyApplicationDetails
          formDefinitionTitle={formDefinitionTitle}
          myApplicationFormData={myApplicationFormData}
          myApplicationGinisData={myApplicationGinisData}
        />
      </PageLayout>
    </GeneralContextProvider>
  )
}

export default SsrAuthProviderHOC(AccountMyApplicationsPage)
