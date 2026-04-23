import { useTranslation } from 'next-i18next/pages'

import UserProfileConsents from '@/src/components/page-contents/UserProfilePageContent/UserProfileConsents/UserProfileConsents'
import UserProfileDetails from '@/src/components/page-contents/UserProfilePageContent/UserProfileDetails/UserProfileDetails'
import UserProfilePassword from '@/src/components/page-contents/UserProfilePageContent/UserProfilePassword/UserProfilePassword'
import PageHeader from '@/src/components/segments/PageHeader/PageHeader'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=822-65528
 */

const UserProfilePageContent = () => {
  const { t } = useTranslation('account')

  return (
    <>
      <PageHeader title={t('account_section_my_profile.title')} />
      <div className="flex flex-col gap-2.5 py-6 lg:gap-6 lg:py-10">
        <UserProfileDetails />
        <UserProfilePassword />
        <UserProfileConsents />
      </div>
    </>
  )
}

export default UserProfilePageContent
