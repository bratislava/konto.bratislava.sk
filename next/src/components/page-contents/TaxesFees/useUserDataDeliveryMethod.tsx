import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'

import { useUser } from '@/src/frontend/hooks/useUser'

export const useUserDataDeliveryMethod = () => {
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

  return {
    deliveryMethod: officialCorrespondenceChannel,
    deliveryMethodEffectiveInCurrentYear,
    hasChangedDeliveryMethodAfterDeadline,
    canUserChangeDeliveryMethod,
    showChannelNeededBanner: showEmailCommunicationBanner,
  }
}
