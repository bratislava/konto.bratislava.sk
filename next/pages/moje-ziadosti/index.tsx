import { getDraftApplications } from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsList'
import MyApplicationsSection from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import { GetFormsResponseDto } from 'openapi-clients/forms'

import { getEmailFormSlugs } from '../../components/forms/segments/AccountSections/MyApplicationsSection/patchApplicationFormIfNeededServer'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountMyApplicationsPageProps = {
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
  async ({ context, getAccessToken }) => {
    const selectedSection = context.query.sekcia
      ? slovakToEnglishSectionNames[context.query.sekcia as ApplicationsListVariant]
      : 'SENT'
    const currentPage = parseInt(context.query.strana as string, 10) || 1
    const emailFormSlugs = getEmailFormSlugs()

    return {
      props: {
        applications: await getDraftApplications(
          selectedSection,
          currentPage,
          emailFormSlugs,
          getAccessToken,
        ),
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
  selectedSection,
  applications,
  formDefinitionSlugTitleMap,
  emailFormSlugs,
}: AccountMyApplicationsPageProps) => {
  return (
    <AccountPageLayout>
      <MyApplicationsSection
        selectedSection={selectedSection}
        applications={applications}
        formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
        emailFormSlugs={emailFormSlugs}
      />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountMyApplicationsPage)
