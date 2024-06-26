import { GetFormsResponseDto } from '@clients/openapi-forms'
import { getDraftApplications } from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsList'
import MyApplicationsSection from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { formDefinitions } from 'forms-shared/definitions/formDefinitions'

import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountMyApplicationsPageProps = {
  applications: GetFormsResponseDto
  selectedSection: ApplicationsListVariant
  formDefinitionSlugTitleMap: Record<string, string>
}
export const sections = ['SENT', 'SENDING', 'DRAFT'] as const

export type ApplicationsListVariant = (typeof sections)[number]

const slovakToEnglishSectionNames: Record<string, ApplicationsListVariant> = {
  odoslane: 'SENT',
  'odosiela-sa': 'SENDING',
  koncepty: 'DRAFT',
}

const getFormDefinitionSlugTitleMap = () =>
  Object.fromEntries(formDefinitions.map((form) => [form.slug, form.title]))

export const getServerSideProps = amplifyGetServerSideProps(
  async ({ context, getAccessToken }) => {
    const selectedSection = context.query.sekcia
      ? slovakToEnglishSectionNames[context.query.sekcia as ApplicationsListVariant]
      : 'SENT'
    const currentPage = parseInt(context.query.strana as string, 10) || 1

    return {
      props: {
        applications: await getDraftApplications(selectedSection, currentPage, getAccessToken),
        selectedSection,
        formDefinitionSlugTitleMap: getFormDefinitionSlugTitleMap(),
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
}: AccountMyApplicationsPageProps) => {
  return (
    <AccountPageLayout>
      <MyApplicationsSection
        selectedSection={selectedSection}
        applications={applications}
        formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
      />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountMyApplicationsPage)
