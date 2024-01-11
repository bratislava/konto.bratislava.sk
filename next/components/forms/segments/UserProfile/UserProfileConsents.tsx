import cx from 'classnames'
import { showSnackbar } from 'frontend/utils/notifications'
import { useTranslation } from 'next-i18next'

import { Gdpr } from '../../../../frontend/dtos/generalApiDto'
import useUser from '../../../../frontend/hooks/useUser'
import UserConsent from './UserConsent'
import UserProfileSection from './UserProfileSection'
import UserProfileSectionHeader from './UserProfileSectionHeader'

const UserProfileConsents = () => {
  const { t } = useTranslation('account')
  const user = useUser()

  const handleOnChangeConsent = async (isSelected: boolean) => {
    const gdprData: Gdpr[] = [{ category: 'ESBS', type: 'MARKETING' }]
    const res = isSelected ? await user.subscribe(gdprData) : await user.unsubscribe(gdprData)
    if (res) {
      showSnackbar(t('profile_detail.success_alert'), 'success')
    } else {
      showSnackbar(t('profile_detail.error_alert'), 'error')
    }
  }

  const isSelected = user.data?.gdprData
    .filter((x) => x.type === 'MARKETING' && x.category === 'ESBS')
    .some((x) => x.subType === 'subscribe')
  return (
    <UserProfileSection>
      <UserProfileSectionHeader
        title={t('consents.title')}
        text={t('consents.text')}
        underline
        isMobileColumn
      />
      <div className={cx('px-4', 'md:px-8')}>
        <UserConsent
          consent={{
            id: 'receive_information',
            title: t('consents.receive_information.title'),
            text: t('consents.receive_information.text'),
            isDisabled: false,
            isSelected: isSelected ?? false,
          }}
          isLast
          onChange={handleOnChangeConsent}
        />
      </div>
    </UserProfileSection>
  )
}

export default UserProfileConsents
