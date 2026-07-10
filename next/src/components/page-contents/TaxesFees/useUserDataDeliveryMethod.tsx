import { useTranslation } from 'next-i18next/pages'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'

import { useUser } from '@/src/frontend/hooks/useUser'

export const useUserDataDeliveryMethod = () => {
  const { t } = useTranslation('account')

  const { userData } = useUser()

  if (
    !('officialCorrespondenceChannel' in userData) ||
    !('showEmailCommunicationBanner' in userData) ||
    !('hasChangedDeliveryMethodAfterDeadline' in userData)
  ) {
    throw new Error('This hook must be only used when the user is a physical person.')
  }

  const {
    officialCorrespondenceChannel,
    showEmailCommunicationBanner,
    hasChangedDeliveryMethodAfterDeadline,
  } = userData

  const deliveryMethodEffectiveInCurrentYear = hasChangedDeliveryMethodAfterDeadline
    ? UserOfficialCorrespondenceChannelEnum.Postal
    : officialCorrespondenceChannel

  const canUserChangeDeliveryMethod =
    officialCorrespondenceChannel !== UserOfficialCorrespondenceChannelEnum.Edesk

  const deliveryMethodLabel = officialCorrespondenceChannel
    ? {
        [UserOfficialCorrespondenceChannelEnum.Email]: t('taxes.communication_channel.email'),
        [UserOfficialCorrespondenceChannelEnum.Postal]: t('taxes.communication_channel.postal'),
        [UserOfficialCorrespondenceChannelEnum.Edesk]: t('taxes.communication_channel.edesk'),
      }[officialCorrespondenceChannel]
    : null

  return {
    deliveryMethod: officialCorrespondenceChannel,
    deliveryMethodEffectiveInCurrentYear,
    deliveryMethodLabel,
    hasChangedDeliveryMethodAfterDeadline,
    canUserChangeDeliveryMethod,
    showChannelNeededBanner: showEmailCommunicationBanner,
  }
}
