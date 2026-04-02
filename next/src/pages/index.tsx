import { strapiClient } from '@/src/clients/graphql-strapi'
import {
  HomepageAnnouncementEntityFragment,
  MunicipalServiceCardEntityFragment,
} from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import HomepageContent from '@/src/components/page-contents/HomepageContent/HomepageContent'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { isDefined } from '@/src/frontend/utils/general'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

const filterValidAnnouncements = (
  announcements: HomepageAnnouncementEntityFragment[],
): HomepageAnnouncementEntityFragment[] => {
  const now = new Date()

  return announcements
    .filter((announcement) => {
      const { dateFrom, dateTo } = announcement
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
  const services = homepageQuery.homepage?.services.filter(isDefined) ?? []
  const servicesLegalPerson =
    homepageQuery.homepage?.servicesLegalPerson.filter(isDefined) ?? []

  const allAnnouncements =
    homepageQuery.homepage?.announcements.filter(isDefined) ?? []
  const allAnnouncementsLegalPerson =
    homepageQuery.homepage?.announcementsLegalPerson.filter(isDefined) ?? []

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
      <HomepageContent
        services={services}
        servicesLegalPerson={servicesLegalPerson}
        announcements={announcements}
        announcementsLegalPerson={announcementsLegalPerson}
      />
    </PageLayout>
  )
}

export default SsrAuthProviderHOC(AccountIntroPage)
