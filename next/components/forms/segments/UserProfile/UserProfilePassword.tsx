import { LockIcon } from '@assets/ui-icons'
import Button from 'components/forms/simple-components/Button'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../frontend/api/constants'
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
        childrenToColumn
      >
        <Button
          variant="black"
          startIcon={<LockIcon fill="white" className="h-6 w-6" />}
          size="sm"
          text={t('password_change.button')}
          onPress={() => push(ROUTES.PASSWORD_CHANGE)}
          className="w-full md:w-fit"
        />
      </UserProfileSectionHeader>
    </UserProfileSection>
  )
}

export default UserProfilePassword
