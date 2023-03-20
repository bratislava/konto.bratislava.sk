import LockIcon from '@assets/images/forms/lock-white.svg'
import Button from 'components/forms/simple-components/Button'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import UserProfileSection from './UserProfileSection'
import UserProfileSectionHeader from './UserProfileSectionHeader'

const UserProfilePassword = () => {
  const { t } = useTranslation('account')
  const { push } = useRouter()
  return (
    <UserProfileSection>
      <UserProfileSectionHeader
        title={t('password_change.title')}
        text={t('password_change.text')}
        isMobileColumn
      >
        <Button
          variant="black"
          startIcon={<LockIcon />}
          size="sm"
          className="w-full md:w-fit"
          text={t('password_change.button')}
          onPress={() => (window.location.href = '/password-change')}
        />
      </UserProfileSectionHeader>
    </UserProfileSection>
  )
}

export default UserProfilePassword
