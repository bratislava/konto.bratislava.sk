import { useTranslation } from 'next-i18next'

import { LockIcon } from '@/assets/ui-icons'
import UserProfileSection from '@/components/forms/segments/UserProfile/UserProfileSection'
import UserProfileSectionHeader from '@/components/forms/segments/UserProfile/UserProfileSectionHeader'
import Button from '@/components/forms/simple-components/Button'
import { ROUTES } from '@/frontend/api/constants'

const UserProfilePassword = () => {
  const { t } = useTranslation('account')

  return (
    <UserProfileSection>
      <UserProfileSectionHeader
        title={t('my_profile.password_change.title')}
        text={t('my_profile.password_change.text')}
        isMobileColumn
        childrenToColumn
      >
        <Button
          variant="solid"
          startIcon={<LockIcon />}
          href={ROUTES.PASSWORD_CHANGE}
          fullWidthMobile
          data-cy="change-password-button"
        >
          {t('my_profile.password_change.button')}
        </Button>
      </UserProfileSectionHeader>
    </UserProfileSection>
  )
}

export default UserProfilePassword
