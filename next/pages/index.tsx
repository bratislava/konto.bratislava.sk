import { strapiClient } from '@clients/graphql-strapi'
import {
  HomepageAnnouncementEntityFragment,
  MunicipalServiceCardEntityFragment,
} from '@clients/graphql-strapi/api'
import IntroSection from 'components/forms/segments/AccountSections/IntroSection/IntroSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { isDefined } from 'frontend/utils/general'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

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
    <AccountPageLayout>
      <IntroSection
        services={services}
        servicesLegalPerson={servicesLegalPerson}
        announcements={announcements}
        announcementsLegalPerson={announcementsLegalPerson}
      />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountIntroPage)
