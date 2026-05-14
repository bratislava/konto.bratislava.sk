import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import { GetFormsResponseDto } from 'openapi-clients/forms'

import { strapiClient } from '@/src/clients/graphql-strapi'
import { GeneralQuery } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { getDraftApplications } from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsList'
import MyApplicationsPageContent from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsPageContent'
import { getEmailFormSlugs } from '@/src/components/page-contents/MyApplicationsPageContent/patchApplicationFormIfNeededServer'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type AccountMyApplicationsPageProps = {
  general: GeneralQuery
  applications: GetFormsResponseDto
  selectedSection: ApplicationsListVariant
  formDefinitionSlugTitleMap: Record<string, string>
  emailFormSlugs: string[]
}
export const sections = ['SENT', 'SENDING', 'DRAFT'] as const

export type ApplicationsListVariant = (typeof sections)[number]

const slovakToEnglishSectionNames: Record<string, ApplicationsListVariant> = {
  odoslane: 'SENT',
  'odosiela-sa': 'SENDING',
  koncepty: 'DRAFT',
}

const getFormDefinitionSlugTitleMap = () =>
  Object.fromEntries(
    formDefinitions.map((formDefinition) => [formDefinition.slug, formDefinition.title]),
  )

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context, fetchAuthSession }) => {
    const selectedSection = context.query.sekcia
      ? slovakToEnglishSectionNames[context.query.sekcia as ApplicationsListVariant]
      : 'SENT'
    const currentPage = parseInt(context.query.strana as string, 10) || 1
    const emailFormSlugs = getEmailFormSlugs()

    const [general, applications] = await Promise.all([
      strapiClient.General(),
      getDraftApplications(selectedSection, currentPage, emailFormSlugs, fetchAuthSession),
    ])

    return {
      props: {
        general,
        applications,
        selectedSection,
        formDefinitionSlugTitleMap: getFormDefinitionSlugTitleMap(),
        emailFormSlugs: getEmailFormSlugs(),
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const AccountMyApplicationsPage = ({
  general,
  selectedSection,
  applications,
  formDefinitionSlugTitleMap,
  emailFormSlugs,
}: AccountMyApplicationsPageProps) => {
  return (
    <GeneralContextProvider general={general}>
      <PageLayout>
        <MyApplicationsPageContent
          selectedSection={selectedSection}
          applications={applications}
          formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          emailFormSlugs={emailFormSlugs}
        />
      </PageLayout>
    </GeneralContextProvider>
  )
}

export default SsrAuthProviderHOC(AccountMyApplicationsPage)
