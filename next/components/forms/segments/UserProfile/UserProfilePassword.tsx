import { LockIcon } from '@assets/ui-icons'
import Button from 'components/forms/simple-components/ButtonNew'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../frontend/api/constants'
import UserProfileSection from './UserProfileSection'
import UserProfileSectionHeader from './UserProfileSectionHeader'

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
          variant="black-solid"
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
