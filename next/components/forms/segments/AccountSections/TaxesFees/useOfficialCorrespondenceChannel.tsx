import { useUser } from 'frontend/hooks/useUser'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'

export const useOfficialCorrespondenceChannel = () => {
  const { userData } = useUser()

  if (
    !('officialCorrespondenceChannel' in userData) ||
    !('showEmailCommunicationBanner' in userData) ||
    !('changedDeliveryMethodAfterDeadline' in userData)
  ) {
    throw new Error('This hook must be only used when the user is a physical person.')
  }

  const {
    officialCorrespondenceChannel,
    showEmailCommunicationBanner,
    changedDeliveryMethodAfterDeadline,
  } = userData

  const isChannelChangeEffectiveNextYear = changedDeliveryMethodAfterDeadline
  const channelEffectiveInCurrentYear = isChannelChangeEffectiveNextYear
    ? UserOfficialCorrespondenceChannelEnum.Postal
    : officialCorrespondenceChannel

  const canUserChangeChannel =
    officialCorrespondenceChannel !== UserOfficialCorrespondenceChannelEnum.Edesk

  return {
    channel: officialCorrespondenceChannel,
    channelEffectiveInCurrentYear,
    isChannelChangeEffectiveNextYear,
    canUserChangeChannel,
    showChannelNeededBanner: showEmailCommunicationBanner,
  }
}
