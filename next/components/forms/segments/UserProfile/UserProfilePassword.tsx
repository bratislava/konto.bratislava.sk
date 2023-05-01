import LockIcon from '@assets/images/new-icons/ui/lock.svg'
import { ROUTES } from '@utils/constants'
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
        childrenToColumn
      >
        <Button
          variant="black"
          startIcon={<LockIcon fill="white" className="w-6 h-6" />}
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
