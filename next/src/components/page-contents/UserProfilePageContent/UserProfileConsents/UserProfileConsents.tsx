import { useTranslation } from 'next-i18next/pages'
import { GDPRCategoryEnum, GDPRTypeEnum } from 'openapi-clients/city-account'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import UserProfileConsentsItem from '@/src/components/page-contents/UserProfilePageContent/UserProfileConsents/UserProfileConsentsItem'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { useUserSubscription } from '@/src/frontend/hooks/useUser'

const UserProfileConsents = () => {
  const { t } = useTranslation('account')
  const { showToast } = useToast()

  const { isSubscribed, changeSubscription, subscriptionChangePending } = useUserSubscription({
    category: GDPRCategoryEnum.Esbs,
    type: GDPRTypeEnum.Marketing,
  })

  const handleOnChangeConsent = async (newValue: boolean) => {
    if (subscriptionChangePending) {
      return
    }

    await changeSubscription(newValue, {
      onSuccess: () => {
        showToast({
          message: newValue
            ? t('my_profile.consents.success_on_snackbar_message')
            : t('my_profile.consents.success_off_snackbar_message'),
          variant: 'success',
        })
      },
      onError: () => {
        showToast({ message: t('my_profile.consents.error_snackbar_message'), variant: 'error' })
      },
    })
  }

  return (
    <SectionContainer>
      <div className="rounded-lg border border-border-passive-primary p-4 lg:p-6">
        <UserProfileConsentsItem
          consent={{
            id: 'receive_information',
            title: t('my_profile.consents.receive_information.title'),
            text: t('my_profile.consents.receive_information.text'),
            isDisabled: subscriptionChangePending,
            isSelected: isSubscribed,
          }}
          onChange={handleOnChangeConsent}
        />
      </div>
    </SectionContainer>
  )
}

export default UserProfileConsents
