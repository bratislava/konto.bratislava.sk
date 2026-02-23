import { useTranslation } from 'next-i18next'
import { GDPRCategoryEnum, GDPRTypeEnum } from 'openapi-clients/city-account'

import BoxedSection from '@/src/components/page-contents/UserProfilePageContent/BoxedSection'
import UserConsent from '@/src/components/page-contents/UserProfilePageContent/UserConsent'
import useSnackbar from '@/src/frontend/hooks/useSnackbar'
import { useUserSubscription } from '@/src/frontend/hooks/useUser'

const UserProfileConsents = () => {
  const { t } = useTranslation('account')
  const { isSubscribed, changeSubscription, subscriptionChangePending } = useUserSubscription({
    category: GDPRCategoryEnum.Esbs,
    type: GDPRTypeEnum.Marketing,
  })

  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })

  const handleOnChangeConsent = async (newValue: boolean) => {
    if (subscriptionChangePending) {
      return
    }

    await changeSubscription(newValue, {
      onSuccess: () => {
        openSnackbarSuccess(
          newValue
            ? t('my_profile.consents.success_on_snackbar_message')
            : t('my_profile.consents.success_off_snackbar_message'),
          3000,
        )
      },
      onError: () => {
        openSnackbarError(t('my_profile.consents.error_snackbar_message'))
      },
    })
  }

  return (
    <BoxedSection>
      <div className="px-4 md:px-8">
        <UserConsent
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
    </BoxedSection>
  )
}

export default UserProfileConsents
