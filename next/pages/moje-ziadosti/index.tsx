import { GetFormsResponseDto } from '@clients/openapi-forms'
import { getDraftApplications } from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsList'
import MyApplicationsSection from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

type AccountMyApplicationsPageProps = {
  applications: GetFormsResponseDto
  selectedSection: ApplicationsListVariant
}
export const sections = ['SENT', 'SENDING', 'DRAFT'] as const

export type ApplicationsListVariant = (typeof sections)[number]

const slovakToEnglishSectionNames: Record<string, ApplicationsListVariant> = {
  odoslane: 'SENT',
  'odosiela-sa': 'SENDING',
  koncepty: 'DRAFT',
}

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
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const AccountMyApplicationsPage = ({
  selectedSection,
  applications,
}: AccountMyApplicationsPageProps) => {
  return (
    <AccountPageLayout>
      <MyApplicationsSection selectedSection={selectedSection} applications={applications} />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountMyApplicationsPage)
