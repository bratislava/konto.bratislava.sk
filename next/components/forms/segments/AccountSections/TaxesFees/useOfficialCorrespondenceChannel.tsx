import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'

import { useUser } from '@/frontend/hooks/useUser'

export const useOfficialCorrespondenceChannel = () => {
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

  const channelEffectiveInCurrentYear = hasChangedDeliveryMethodAfterDeadline
    ? UserOfficialCorrespondenceChannelEnum.Postal
    : officialCorrespondenceChannel

  const canUserChangeChannel =
    officialCorrespondenceChannel !== UserOfficialCorrespondenceChannelEnum.Edesk

  return {
    channel: officialCorrespondenceChannel,
    channelEffectiveInCurrentYear,
    hasChangedDeliveryMethodAfterDeadline,
    canUserChangeChannel,
    showChannelNeededBanner: showEmailCommunicationBanner,
  }
}
