import { useTranslation } from 'next-i18next'
import { GDPRCategoryEnum, GDPRTypeEnum } from 'openapi-clients/city-account'

import useSnackbar from '../../../../frontend/hooks/useSnackbar'
import { useUserSubscription } from '../../../../frontend/hooks/useUser'
import UserConsent from './UserConsent'
import UserProfileSection from './UserProfileSection'
import UserProfileSectionHeader from './UserProfileSectionHeader'

const UserProfileConsents = () => {
  const { t } = useTranslation('account')
  const { isSubscribed, changeSubscription, subscriptionChangePending } = useUserSubscription({
    category: GDPRCategoryEnum.Esbs,
    type: GDPRTypeEnum.Marketing,
  })

  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })

  const handleOnChangeConsent = async (value: boolean) => {
    if (subscriptionChangePending) {
      return
    }

    await changeSubscription(value, {
      onSuccess: () => {
        openSnackbarSuccess(t('profile_detail.success_alert'), 3000)
      },
      onError: () => {
        openSnackbarError(t('profile_detail.error_alert'))
      },
    })
  }

  return (
    <UserProfileSection>
      <UserProfileSectionHeader
        title={t('consents.title')}
        text={t('consents.text')}
        underline
        isMobileColumn
      />
      <div className="px-4 md:px-8">
        <UserConsent
          consent={{
            id: 'receive_information',
            title: t('consents.receive_information.title'),
            text: t('consents.receive_information.text'),
            isDisabled: subscriptionChangePending,
            isSelected: isSubscribed,
          }}
          isLast
          onChange={handleOnChangeConsent}
        />
      </div>
    </UserProfileSection>
  )
}

export default UserProfileConsents
