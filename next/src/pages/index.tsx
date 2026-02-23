import { strapiClient } from '@/src/clients/graphql-strapi'
import {
  HomepageAnnouncementEntityFragment,
  MunicipalServiceCardEntityFragment,
} from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import IntroPageContent from '@/src/components/page-contents/IntroPageContent/IntroPageContent'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { isDefined } from '@/src/frontend/utils/general'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

const filterValidAnnouncements = (
  announcements: HomepageAnnouncementEntityFragment[],
): HomepageAnnouncementEntityFragment[] => {
  const now = new Date()

  return announcements
    .filter((announcement) => {
      if (!announcement.attributes) {
        return false
      }

      const { dateFrom, dateTo } = announcement.attributes
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      const isAfterFromDate = !fromDate || now >= fromDate
      const isBeforeToDate = !toDate || now <= toDate

      return isAfterFromDate && isBeforeToDate
    })
    .slice(0, 3)
}

export const getServerSideProps = amplifyGetServerSideProps<AccountIntroPageProps>(async () => {
  const homepageQuery = await strapiClient.Homepage()
  const services = homepageQuery.homepage?.data?.attributes?.services?.data.filter(isDefined) ?? []
  const servicesLegalPerson =
    homepageQuery.homepage?.data?.attributes?.servicesLegalPerson?.data.filter(isDefined) ?? []

  const allAnnouncements =
    homepageQuery.homepage?.data?.attributes?.announcements?.data.filter(isDefined) ?? []
  const allAnnouncementsLegalPerson =
    homepageQuery.homepage?.data?.attributes?.announcementsLegalPerson?.data.filter(isDefined) ?? []

  const announcements = filterValidAnnouncements(allAnnouncements)
  const announcementsLegalPerson = filterValidAnnouncements(allAnnouncementsLegalPerson)

  return {
    props: {
      services,
      servicesLegalPerson,
      announcements,
      announcementsLegalPerson,
      ...(await slovakServerSideTranslations()),
    },
  }
})

type AccountIntroPageProps = {
  services: MunicipalServiceCardEntityFragment[]
  servicesLegalPerson: MunicipalServiceCardEntityFragment[]
  announcements: HomepageAnnouncementEntityFragment[]
  announcementsLegalPerson: HomepageAnnouncementEntityFragment[]
}

const AccountIntroPage = ({
  services,
  servicesLegalPerson,
  announcements,
  announcementsLegalPerson,
}: AccountIntroPageProps) => {
  return (
    <PageLayout>
      <IntroPageContent
        services={services}
        servicesLegalPerson={servicesLegalPerson}
        announcements={announcements}
        announcementsLegalPerson={announcementsLegalPerson}
      />
    </PageLayout>
  )
}

export default SsrAuthProviderHOC(AccountIntroPage)
